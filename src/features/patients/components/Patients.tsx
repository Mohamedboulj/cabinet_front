import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { patientService } from '@/features/patients/api/patients.api';
import { getApiErrorMessage } from '@/utils/errorUtils';
import type { Patient } from '@/types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import DataTableSkeleton from '@/components/skeletons/DataTableSkeleton';

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients();
      setPatients(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('patients.loadError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPatients();
      return;
    }

    setLoading(true);
    try {
      const response = await patientService.searchPatients(searchQuery);
      setPatients(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('patients.searchError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const openNewDialog = () => {
    setEditingPatient(null);
    setFormData({});
    setDialogVisible(true);
  };

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({ ...patient });
    setDialogVisible(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingPatient) {
        await patientService.updatePatient(editingPatient.id, formData);
        toast.current?.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('patients.updated'),
        });
      } else {
        await patientService.createPatient(formData);
        toast.current?.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('patients.created'),
        });
      }
      setDialogVisible(false);
      loadPatients();
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

  const confirmDelete = (patient: Patient) => {
    confirmDialog({
      message: t('patients.confirmDeleteMessage', { name: `${patient.lastName} ${patient.firstName}` }),
      header: t('common.confirmDelete'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleDelete(patient),
    });
  };

  const handleDelete = async (patient: Patient) => {
    try {
      await patientService.deletePatient(patient.id);
      toast.current?.show({
        severity: 'success',
        summary: t('common.success'),
        detail: t('patients.deleted'),
      });
      loadPatients();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: getApiErrorMessage(error, t('patients.deleteError')),
      });
    }
  };

  const actionBodyTemplate = (rowData: Patient) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-info p-button-sm"
        onClick={() => navigate(`/patients/${rowData.id}`)}
        tooltip={t('common.view')}
      />
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-warning p-button-sm"
        onClick={() => openEditDialog(rowData)}
        tooltip={t('common.edit')}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-sm"
        onClick={() => confirmDelete(rowData)}
        tooltip={t('common.delete')}
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  );

  const ageBodyTemplate = (rowData: Patient) => {
    if (!rowData.birthDate) return '-';
    const birthDate = new Date(rowData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} ${t('patients.years')}`;
  };

  const genderBodyTemplate = (rowData: Patient) => {
    if (rowData.gender === 'M') {
      return <Tag icon="pi pi-male" value={t('patients.male')} className="bg-blue-100 text-blue-700" />;
    } else if (rowData.gender === 'F') {
      return <Tag icon="pi pi-female" value={t('patients.female')} className="bg-pink-100 text-pink-700" />;
    }
    return '-';
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
        label={editingPatient ? t('common.edit') : t('common.create')}
        icon="pi pi-check"
        loading={submitting}
        onClick={handleSubmit}
      />
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold m-0">{t('patients.title')}</h1>
        <Button
          label={t('patients.newPatient')}
          icon="pi pi-plus"
          className="p-button-success"
          onClick={openNewDialog}
        />
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <span className="p-input-icon-left flex-1">
          <i className="pi pi-search" />
          <InputText
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('patients.searchPlaceholder')}
            className="w-full"
            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          />
        </span>
        <Button icon="pi pi-search" onClick={handleSearch} />
        <Button icon="pi pi-refresh" className="p-button-secondary" onClick={loadPatients} />
      </div>

      {/* Patients Table */}
      {loading ? (
        <DataTableSkeleton headers={[t('patients.headers.id'), t('patients.headers.lastName'), t('patients.headers.firstName'), t('patients.headers.cin'), t('patients.headers.phone'), t('patients.headers.age'), t('patients.headers.gender'), t('patients.headers.actions')]} />
      ) : (
        <DataTable
          value={patients}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage={t('patients.noPatients')}
          className="shadow-2"
        >
          <Column field="id" header={t('patients.headers.id')} sortable style={{ width: '5rem' }} />
          <Column field="lastName" header={t('patients.headers.lastName')} sortable />
          <Column field="firstName" header={t('patients.headers.firstName')} sortable />
          <Column field="cin" header={t('patients.headers.cin')} sortable />
          <Column field="phone" header={t('patients.headers.phone')} />
          <Column field="age" header={t('patients.headers.age')} body={ageBodyTemplate} sortable />
          <Column field="gender" header={t('patients.headers.gender')} body={genderBodyTemplate} sortable />
          <Column body={actionBodyTemplate} header={t('patients.headers.actions')} style={{ width: '10rem' }} />
        </DataTable>
      )}

      {/* Patient Dialog */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header={editingPatient ? t('patients.editDialog') : t('patients.newDialog')}
        className="w-11/12 md:w-6 lg:w-8"
        footer={dialogFooter}
      >
        <div className="grid">
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('patients.form.lastName')}</label>
            <InputText
              value={formData.lastName || ''}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('patients.form.firstName')}</label>
            <InputText
              value={formData.firstName || ''}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('patients.form.cin')}</label>
            <InputText
              value={formData.cin || ''}
              onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('patients.form.phone')}</label>
            <InputText
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('patients.form.email')}</label>
            <InputText
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('patients.form.birthDate')}</label>
            <Calendar
              value={formData.birthDate ? new Date(formData.birthDate) : null}
              onChange={(e) => setFormData({ ...formData, birthDate: e.value?.toISOString() })}
              dateFormat="dd/mm/yy"
              className="w-full"
              showIcon
            />
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('patients.form.gender')}</label>
            <Dropdown
              value={formData.gender || ''}
              options={[
                { label: t('patients.male'), value: 'M' },
                { label: t('patients.female'), value: 'F' },
              ]}
              onChange={(e) => setFormData({ ...formData, gender: e.value })}
              placeholder={t('common.select')}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('patients.form.bloodType')}</label>
            <Dropdown
              value={formData.bloodType || ''}
              options={[
                { label: 'A+', value: 'A+' },
                { label: 'A-', value: 'A-' },
                { label: 'B+', value: 'B+' },
                { label: 'B-', value: 'B-' },
                { label: 'AB+', value: 'AB+' },
                { label: 'AB-', value: 'AB-' },
                { label: 'O+', value: 'O+' },
                { label: 'O-', value: 'O-' },
              ]}
              onChange={(e) => setFormData({ ...formData, bloodType: e.value })}
              placeholder={t('common.select')}
              className="w-full"
            />
          </div>
          <div className="col-12 field">
            <label className="block font-medium mb-2">{t('patients.form.address')}</label>
            <InputText
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 field">
            <label className="block font-medium mb-2">{t('patients.form.medicalHistory')}</label>
            <textarea
              value={formData.medicalHistory || ''}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              className="w-full p-inputtextarea p-inputtext"
              rows={3}
            />
          </div>
          <div className="col-12 field">
            <label className="block font-medium mb-2">{t('patients.form.allergies')}</label>
            <textarea
              value={formData.allergies || ''}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full p-inputtextarea p-inputtext"
              rows={2}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Patients;
