import { useState, useEffect, useRef } from 'react';
import { getApiErrorMessage } from '@/utils/errorUtils';
import type { User } from '@/types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FileUpload, type ItemTemplateOptions, type FileUploadHeaderTemplateOptions, type FileUploadSelectEvent as PrimeFileUploadSelectEvent } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Tooltip } from 'primereact/tooltip';
import { userService } from '@/features/users/api/users.api';
import DataTableSkeleton from '@/components/skeletons/DataTableSkeleton';
import { useTranslation } from 'react-i18next';

const Users: React.FC = () => {
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [totalSize, setTotalSize] = useState(0);
  const fileUploadRef = useRef<FileUpload>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('users.loadError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const roleBodyTemplate = (rowData: User) => {
    const roleLabels: Record<string, string> = {
      'ROLE_ADMIN': t('users.roles.admin'),
      'ROLE_MEDECIN': t('users.roles.doctor'),
      'ROLE_SECRETAIRE': t('users.roles.secretary'),
    };
    return (
      <div className="flex gap-1">
        {rowData.roles.map((role) => (
          <Tag key={role} value={roleLabels[role] || role} className="text-xs" />
        ))}
      </div>
    );
  };

  const statusBodyTemplate = (rowData: User) => {
    return rowData.isActive ? (
      <Tag value={t('users.active')} severity="success" />
    ) : (
      <Tag value={t('users.inactive')} severity="danger" />
    );
  };

  const openNewDialog = () => {
    setEditingUser(null);
    setFormData({ isActive: true, roles: ['ROLE_SECRETAIRE'] });
    setSelectedLogoFile(null);
    setTotalSize(0);
    setDialogVisible(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({ ...user });
    setSelectedLogoFile(null);
    setTotalSize(0);
    setDialogVisible(true);
  };

  const confirmDelete = (user: User) => {
    confirmDialog({
      message: t('users.confirmDeleteMessage', { name: `${user.firstName} ${user.lastName}` }),
      header: t('common.confirmation'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        toast.current?.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('users.deleted'),
        });
      },
    });
  };

  const handleToggleActive = (user: User) => {
    const action = user.isActive ? t('users.deactivate') : t('users.activate');
    confirmDialog({
      message: t('users.confirmToggle', { action, name: `${user.firstName} ${user.lastName}` }),
      header: t('common.confirmation'),
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          if (user.isActive) {
            await userService.deactivateUser(user.id);
          } else {
            await userService.activateUser(user.id);
          }
          toast.current?.show({
            severity: 'success',
            summary: t('common.success'),
            detail: t('users.toggleSuccess', { action: user.isActive ? t('users.deactivated') : t('users.activated') }),
          });
          loadUsers();
        } catch (error: any) {
          toast.current?.show({
            severity: 'error',
            summary: t('common.error'),
            detail: getApiErrorMessage(error),
          });
        }
      },
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const submitData = new FormData();

      // Append all fields except logo (handled separately as a File)
      Object.keys(formData).forEach(key => {
        if (key === 'logo') return; // skip, we append the File below
        const val = formData[key as keyof User];
        if (val === undefined || val === null) return;
        if (Array.isArray(val)) {
          val.forEach(item => submitData.append(`${key}[]`, String(item)));
        } else {
          submitData.append(key, String(val));
        }
      });

      // Append the actual File binary if the user selected a new logo
      if (selectedLogoFile) {
        submitData.append('logo', selectedLogoFile);
      }

      if (editingUser) {
        await userService.updateUser(editingUser.id, submitData);
        toast.current?.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('users.updated'),
        });
      } else {
        await userService.createUser(submitData);
        toast.current?.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('users.created'),
        });
      }
      setDialogVisible(false);
      loadUsers();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: getApiErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label={t('common.cancel')}
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setDialogVisible(false)}
      />
      <Button
        label={editingUser ? t('common.edit') : t('common.create')}
        icon="pi pi-check"
        loading={submitting}
        onClick={handleSubmit}
      />
    </div>
  );

  const onTemplateSelect = (e: PrimeFileUploadSelectEvent) => {
    let _totalSize = totalSize;
    let files = e.files;

    // We only take the first file for the logo
    const file = files[0];
    if (file) {
      setSelectedLogoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setFormData({ ...formData, logo: objectUrl });
      _totalSize += file.size || 0;
    }
    setTotalSize(_totalSize);
  };

  const onTemplateClear = () => {
    setTotalSize(0);
    setSelectedLogoFile(null);
    setFormData({ ...formData, logo: editingUser ? editingUser.logo : undefined });
  };

  const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
    const { className, chooseButton, cancelButton } = options;
    const value = totalSize / 10000;
    const formattedValue = fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

    return (
      <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
        {chooseButton}
        {cancelButton}
        <div className="flex align-items-center gap-3 ml-auto">
          <span>{formattedValue} / 1 MB</span>
          <ProgressBar value={value} showValue={false} style={{ width: '10rem', height: '12px' }}></ProgressBar>
        </div>
      </div>
    );
  };

  const itemTemplate = (file: object, props: ItemTemplateOptions) => {
    const f = file as File & { objectURL: string };
    return (
      <div className="flex align-items-center flex-wrap">
        <div className="flex align-items-center" style={{ width: '40%' }}>
          <img alt={f.name} role="presentation" src={f.objectURL} width={50} />
          <span className="flex flex-column text-left ml-3">
            {f.name}
            <small>{new Date().toLocaleDateString()}</small>
          </span>
        </div>
        <Tag value={props.formatSize} severity="warning" className="px-3 py-2" />
        <Button
          type="button"
          icon="pi pi-times"
          className="p-button-outlined p-button-rounded p-button-danger ml-auto"
          onClick={(e) => {
            props.onRemove(e);
            onTemplateClear();
          }}
        />
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column">
        <i className="pi pi-image mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
        <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
          Drag and Drop Image Here
        </span>
      </div>
    );
  };

  const chooseOptions = { icon: 'pi pi-fw pi-images', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined' };
  const cancelOptions = { icon: 'pi pi-fw pi-times', iconOnly: true, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined' };

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold m-0">{t('users.title')}</h1>
        <Button
          label={t('users.newUser')}
          icon="pi pi-plus"
          className="p-button-success"
          onClick={openNewDialog}
        />
      </div>

      {loading ? (
        <DataTableSkeleton headers={[t('users.headers.id'), t('users.headers.lastName'), t('users.headers.firstName'), t('users.headers.email'), t('users.headers.phone'), t('users.headers.specialty'), t('users.headers.roles'), t('users.headers.status'), t('users.headers.actions')]} />
      ) : (
        <DataTable
          value={users}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage={t('users.noUsers')}
          className="shadow-2"
        >
          <Column field="id" header={t('users.headers.id')} sortable style={{ width: '5rem' }} />
          <Column field="lastName" header={t('users.headers.lastName')} sortable />
          <Column field="firstName" header={t('users.headers.firstName')} sortable />
          <Column field="email" header={t('users.headers.email')} sortable />
          <Column field="phone" header={t('users.headers.phone')} />
          <Column field="specialty" header={t('users.headers.specialty')} />
          <Column field="roles" header={t('users.headers.roles')} body={roleBodyTemplate} />
          <Column field="isActive" header={t('users.headers.status')} body={statusBodyTemplate} sortable />
          <Column
            body={(rowData) => (
              <div className="flex gap-1">
                <Button
                  icon="pi pi-pencil"
                  className="p-button-rounded p-button-warning p-button-sm"
                  tooltip={t('common.edit')}
                  tooltipOptions={{ position: 'top' }}
                  onClick={() => openEditDialog(rowData)}
                />
                <Button
                  icon={rowData.isActive ? 'pi pi-lock' : 'pi pi-lock-open'}
                  className={`p-button-rounded p-button-sm ${rowData.isActive ? 'p-button-secondary' : 'p-button-success'}`}
                  tooltip={rowData.isActive ? t('users.deactivate') : t('users.activate')}
                  tooltipOptions={{ position: 'top' }}
                  onClick={() => handleToggleActive(rowData)}
                />
                <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-danger p-button-sm"
                  tooltip={t('common.delete')}
                  tooltipOptions={{ position: 'top' }}
                  onClick={() => confirmDelete(rowData)}
                />
              </div>
            )}
            header={t('users.headers.actions')}
            style={{ width: '10rem' }}
          />
        </DataTable>
      )}

      {/* User Dialog */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header={editingUser ? t('users.editDialog') : t('users.newDialog')}
        className="w-11/12 md:w-6 lg:w-8"
        footer={dialogFooter}
      >
        <div className="flex flex-column gap-3">
          <div className="grid">
            <div className="col-6 field">
              <label className="block font-medium mb-2">{t('users.form.lastName')}</label>
              <InputText
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="col-6 field">
              <label className="block font-medium mb-2">{t('users.form.firstName')}</label>
              <InputText
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          <div className="field">
            <label className="block font-medium mb-2">{t('users.form.email')}</label>
            <InputText
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="field">
            <label className="block font-medium mb-2">{t('users.form.phone')}</label>
            <InputText
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="field">
            <label className="block font-medium mb-2">{t('users.form.specialty')}</label>
            <InputText
              value={formData.specialty || ''}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full"
              placeholder={t('users.form.specialtyPlaceholder')}
            />
          </div>
          <div className="field">
            <label className="block font-medium mb-2">{t('users.form.licenseNumber')}</label>
            <InputText
              value={formData.licenseNumber || ''}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              className="w-full"
              placeholder={t('users.form.licenseNumberPlaceholder')}
            />
          </div>

          <div className="grid">
            <div className="col-6 field">
              <label className="block font-medium mb-2">Diplomé(e)</label>
              <InputText
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="col-6 field" style={{ direction: 'rtl' }}>
              <label className="block font-medium mb-2">شهادة</label>
              <InputText
                value={formData.titleAr || ''}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          <div className="grid">
            <div className="col-6 field">
              <label className="block font-medium mb-2">Ville</label>
              <InputText
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="col-6 field" style={{ direction: 'rtl' }}>
              <label className="block font-medium mb-2">المدينة</label>
              <InputText
                value={formData.cityAr || ''}
                onChange={(e) => setFormData({ ...formData, cityAr: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          <div className="grid">
            <div className="col-6 field">
              <label className="block font-medium mb-2">Address</label>
              <InputText
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="col-6 field" style={{ direction: 'rtl' }}>
              <label className="block font-medium mb-2">العنوان</label>
              <InputText
                value={formData.addressAr || ''}
                onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          <div className="field">
            <label className="block font-medium mb-2">Logo</label>

            {editingUser?.logo && !selectedLogoFile && (
              <div className="mb-3 flex align-items-center p-3 border-1 surface-border border-round">
                <img
                  src={editingUser.logo}
                  alt="Current Logo"
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
                  className="mr-3"
                />
                <div className="flex flex-column">
                  <span className="font-bold">Current Logo</span>
                  <span className="text-sm text-color-secondary">Upload a new image below to replace it.</span>
                </div>
              </div>
            )}

            <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />
            <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />
            <FileUpload
              ref={fileUploadRef}
              name="logo"
              customUpload
              uploadHandler={() => { }}
              accept="image/*"
              maxFileSize={1000000}
              onSelect={onTemplateSelect}
              onError={onTemplateClear}
              onClear={onTemplateClear}
              headerTemplate={headerTemplate}
              itemTemplate={itemTemplate}
              emptyTemplate={emptyTemplate}
              chooseOptions={chooseOptions}
              cancelOptions={cancelOptions}
            />
          </div>

          <div className="field">
            <label className="block font-medium mb-2">{t('users.form.roles')}</label>
            <MultiSelect
              value={formData.roles || []}
              options={[
                { label: t('users.roles.admin'), value: 'ROLE_ADMIN' },
                { label: t('users.roles.doctor'), value: 'ROLE_MEDECIN' },
                { label: t('users.roles.secretary'), value: 'ROLE_SECRETAIRE' },
              ]}
              onChange={(e) => setFormData({ ...formData, roles: e.value })}
              placeholder={t('users.form.selectRoles')}
              className="w-full"
            />
          </div>
          <div className="field">
            <label className="block font-medium mb-2">{t('users.form.currency')}</label>
            <Dropdown
              value={formData.currency || 'MAD'}
              options={[
                { label: 'MAD', value: 'MAD' },
                { label: '€', value: 'EUR' },
                { label: '$', value: 'USD' },
              ]}
              onChange={(e) => setFormData({ ...formData, currency: e.value })}
              className="w-full"
            />
          </div>
          {!editingUser && (
            <div className="field">
              <label className="block font-medium mb-2">{t('users.form.password')}</label>
              <InputText
                type="password"
                className="w-full"
                placeholder={t('users.form.passwordPlaceholder')}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default Users;
