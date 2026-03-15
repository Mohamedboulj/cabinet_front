import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { consultationService } from '@/features/consultations/api/consultations.api';
import { patientService } from '@/features/patients/api/patients.api';
import { userService } from '@/features/users/api/users.api';
import type { Consultation, Patient, User } from '@/types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import DataTableSkeleton from '@/components/skeletons/DataTableSkeleton';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';

const Consultations: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadConsultations();
    loadPatients();
    loadDoctors();
  }, []);

  const loadConsultations = async () => {
    setLoading(true);
    try {
      const response = await consultationService.getConsultations();
      setConsultations(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('consultations.loadError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients();
      setPatients(response.data);
    } catch (error) {
      // Silent fail – patients are only needed for the dropdown
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await userService.getDoctors();
      setDoctors(response.data);
    } catch (error) {
      // Silent fail
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadConsultations();
      return;
    }

    setLoading(true);
    try {
      const response = await consultationService.getConsultations({ search: searchQuery });
      setConsultations(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('consultations.searchError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const openNewDialog = () => {
    setEditingConsultation(null);
    setFormData({ status: 'IN_PROGRESS' });
    setDialogVisible(true);
  };

  const openEditDialog = (consultation: Consultation) => {
    setEditingConsultation(consultation);
    setFormData({
      patientId: consultation.patient?.id,
      doctorId: consultation.doctor?.id,
      reason: consultation.reason,
      anamnesis: consultation.anamnesis,
      examination: consultation.examination,
      diagnosis: consultation.diagnosis,
      notes: consultation.notes,
      recommendations: consultation.recommendations,
      bloodPressure: consultation.bloodPressure,
      weight: consultation.weight,
      temperature: consultation.temperature,
      heartRate: consultation.heartRate,
      respiratoryRate: consultation.respiratoryRate,
      oxygenSaturation: consultation.oxygenSaturation,
      status: consultation.status,
    });
    setDialogVisible(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingConsultation) {
        await consultationService.updateConsultation(editingConsultation.id, formData);
        toast.current?.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('consultations.updated'),
        });
      } else {
        await consultationService.createConsultation(formData);
        toast.current?.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('consultations.created'),
        });
      }
      setDialogVisible(false);
      loadConsultations();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: error.response?.data?.message || t('consultations.errorOccurred'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (consultation: Consultation) => {
    confirmDialog({
      message: t('consultations.deleteConfirm'),
      header: t('common.confirmDelete'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleDelete(consultation),
    });
  };

  const handleDelete = async (consultation: Consultation) => {
    try {
      await consultationService.deleteConsultation(consultation.id);
      toast.current?.show({
        severity: 'success',
        summary: t('common.success'),
        detail: t('consultations.deleted'),
      });
      loadConsultations();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: error.response?.data?.error || t('consultations.deleteError'),
      });
    }
  };

  const handleComplete = async (consultation: Consultation) => {
    try {
      await consultationService.completeConsultation(consultation.id);
      toast.current?.show({
        severity: 'success',
        summary: t('common.success'),
        detail: t('consultations.completed'),
      });
      loadConsultations();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('consultations.completeError'),
      });
    }
  };

  const handleCancel = async (consultation: Consultation) => {
    confirmDialog({
      message: t('consultations.cancelConfirm'),
      header: t('common.confirmation'),
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await consultationService.cancelConsultation(consultation.id);
          toast.current?.show({
            severity: 'success',
            summary: t('common.success'),
            detail: t('consultations.cancelled'),
          });
          loadConsultations();
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: t('common.error'),
            detail: t('consultations.cancelError'),
          });
        }
      },
    });
  };

  const statusBodyTemplate = (rowData: Consultation) => {
    const statusMap: Record<string, { label: string; severity: 'success' | 'warning' | 'danger' }> = {
      'IN_PROGRESS': { label: t('status.inProgress'), severity: 'warning' },
      'COMPLETED': { label: t('status.completedF'), severity: 'success' },
      'CANCELLED': { label: t('status.cancelledF'), severity: 'danger' },
    };
    const status = statusMap[rowData.status] || { label: rowData.status, severity: 'warning' };
    return <Tag value={status.label} severity={status.severity} />;
  };

  const paymentBodyTemplate = (rowData: Consultation) => {
    return rowData.isPaid ? (
      <Tag icon="pi pi-check" value={t('status.paid')} severity="success" />
    ) : (
      <Tag icon="pi pi-times" value={t('consultationDetail.unpaid')} severity="danger" />
    );
  };

  const dateBodyTemplate = (rowData: Consultation) => {
    return new Date(rowData.createdAt).toLocaleString('fr-FR');
  };

  const actionBodyTemplate = (rowData: Consultation) => {
    const canComplete = rowData.status === 'IN_PROGRESS';
    const canCancel = rowData.status === 'IN_PROGRESS';

    return (
      <div className="flex gap-1">
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => navigate(`/consultations/${rowData.id}`)}
          tooltip={t('common.view')}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-warning p-button-sm"
          onClick={() => openEditDialog(rowData)}
          tooltip={t('common.edit')}
        />
        {canComplete && (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-success p-button-sm"
            onClick={() => handleComplete(rowData)}
            tooltip={t('common.complete')}
          />
        )}
        {canCancel && (
          <Button
            icon="pi pi-times-circle"
            className="p-button-rounded p-button-secondary p-button-sm"
            onClick={() => handleCancel(rowData)}
            tooltip={t('common.cancel')}
          />
        )}
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDelete(rowData)}
          tooltip={t('common.delete')}
        />
      </div>
    );
  };
  const patientFullName = (rowData: any) =>
    `${rowData.patient.lastName} ${rowData.patient.firstName}`;

  const doctorFullName = (rowData: any) =>
    `${rowData.doctor.lastName} ${rowData.doctor.firstName}`;

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label={t('common.cancel')}
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setDialogVisible(false)}
      />
      <Button
        label={editingConsultation ? t('common.edit') : t('common.create')}
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
        <h1 className="text-3xl font-bold m-0">{t('consultations.title')}</h1>
        <Button
          label={t('consultations.newConsultation')}
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
            placeholder={t('consultations.searchPlaceholder')}
            className="w-full"
            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          />
        </span>
        <Button icon="pi pi-search" onClick={handleSearch} />
        <Button icon="pi pi-refresh" className="p-button-secondary" onClick={loadConsultations} />
      </div>

      {/* Consultations Table */}
      {loading ? (
        <DataTableSkeleton headers={[t('consultations.headers.refNumber'), t('consultations.headers.patient'), t('consultations.headers.doctor'), t('consultations.headers.date'), t('consultations.headers.reason'), t('consultations.headers.diagnosis'), t('consultations.headers.status'), t('consultations.headers.payment'), t('consultations.headers.actions')]} />
      ) : (
        <DataTable
          value={consultations}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage={t('consultations.noConsultations')}
          className="shadow-2"
        >
          <Column field="referenceNumber" header={t('consultations.headers.refNumber')} sortable />
          <Column field="patient.lastName" header={t('consultations.headers.patient')} body={patientFullName} sortable />
          <Column field="doctor.lastName" header={t('consultations.headers.doctor')} body={doctorFullName} sortable />
          <Column field="createdAt" header={t('consultations.headers.date')} body={dateBodyTemplate} sortable />
          <Column field="reason" header={t('consultations.headers.reason')} />
          <Column field="diagnosis" header={t('consultations.headers.diagnosis')} />
          <Column field="status" header={t('consultations.headers.status')} body={statusBodyTemplate} sortable />
          <Column field="isPaid" header={t('consultations.headers.payment')} body={paymentBodyTemplate} sortable />
          <Column body={actionBodyTemplate} header={t('consultations.headers.actions')} style={{ width: '14rem' }} />
        </DataTable>
      )}

      {/* Consultation Dialog */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header={editingConsultation ? t('consultations.editDialog') : t('consultations.newDialog')}
        className="w-11/12 md:w-8 lg:w-8"
        footer={dialogFooter}
      >
        <div className="grid">
          {/* Patient Selection */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('consultations.form.patient')}</label>
            <Dropdown
              value={formData.patientId}
              options={patients.map((p) => ({ label: `${p.firstName} ${p.lastName}`, value: p.id }))}
              onChange={(e) => setFormData({ ...formData, patientId: e.value })}
              placeholder={t('consultations.form.selectPatient')}
              className="w-full"
              filter
              filterPlaceholder={t('common.searchPlaceholder')}
              disabled={!!editingConsultation}
            />
          </div>

          {/* Doctor Selection */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('consultations.form.doctor')}</label>
            <Dropdown
              value={formData.doctorId}
              options={doctors.map((d) => ({ label: `${d.firstName} ${d.lastName}`, value: d.id }))}
              onChange={(e) => setFormData({ ...formData, doctorId: e.value })}
              placeholder={t('consultations.form.selectDoctor')}
              className="w-full"
              filter
              filterPlaceholder={t('common.searchPlaceholder')}
              disabled={!!editingConsultation} // Assuming the doctor shouldn't be changed for an existing consultation either, like patient.
            />
          </div>

          {/* Status */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('consultations.form.status')}</label>
            <Dropdown
              value={formData.status}
              options={[
                { label: t('status.inProgress'), value: 'IN_PROGRESS' },
                { label: t('status.completedF'), value: 'COMPLETED' },
                { label: t('status.cancelledF'), value: 'CANCELLED' },
              ]}
              onChange={(e) => setFormData({ ...formData, status: e.value })}
              placeholder={t('common.select')}
              className="w-full"
            />
          </div>

          {/* Reason */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('consultations.form.reason')}</label>
            <InputText
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Anamnesis */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('consultations.form.anamnesis')}</label>
            <InputTextarea
              value={formData.anamnesis || ''}
              onChange={(e) => setFormData({ ...formData, anamnesis: e.target.value })}
              className="w-full"
              rows={3}
              autoResize
            />
          </div>

          {/* Examination */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('consultations.form.examination')}</label>
            <InputTextarea
              value={formData.examination || ''}
              onChange={(e) => setFormData({ ...formData, examination: e.target.value })}
              className="w-full"
              rows={3}
              autoResize
            />
          </div>

          {/* Diagnosis */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('consultations.form.diagnosis')}</label>
            <InputTextarea
              value={formData.diagnosis || ''}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full"
              rows={3}
              autoResize
            />
          </div>

          {/* Recommendations */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">{t('consultations.form.recommendations')}</label>
            <InputTextarea
              value={formData.recommendations || ''}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              className="w-full"
              rows={3}
              autoResize
            />
          </div>

          {/* Notes */}
          <div className="col-12 field">
            <label className="block font-medium mb-2">{t('consultations.form.notes')}</label>
            <InputTextarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full"
              rows={2}
              autoResize
            />
          </div>

          {/* Vital Signs Section */}
          <div className="col-12">
            <h3 className="text-lg font-semibold mt-2 mb-3">{t('consultations.form.vitalSigns')}</h3>
          </div>

          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">{t('consultations.form.bloodPressure')}</label>
            <InputText
              value={formData.bloodPressure || ''}
              onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
              className="w-full"
              placeholder="ex: 120/80"
            />
          </div>

          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">{t('consultations.form.weight')}</label>
            <InputText
              value={formData.weight || ''}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full"
              placeholder="ex: 75.5"
            />
          </div>

          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">{t('consultations.form.temperature')}</label>
            <InputText
              value={formData.temperature || ''}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              className="w-full"
              placeholder="ex: 37.0"
            />
          </div>

          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">{t('consultations.form.heartRate')}</label>
            <InputNumber
              value={formData.heartRate || null}
              onValueChange={(e) => setFormData({ ...formData, heartRate: e.value })}
              className="w-full"
              placeholder="ex: 72"
            />
          </div>

          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">{t('consultations.form.respiratoryRate')}</label>
            <InputNumber
              value={formData.respiratoryRate || null}
              onValueChange={(e) => setFormData({ ...formData, respiratoryRate: e.value })}
              className="w-full"
              placeholder="ex: 16"
            />
          </div>

          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">{t('consultations.form.oxygenSaturation')}</label>
            <InputText
              value={formData.oxygenSaturation || ''}
              onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
              className="w-full"
              placeholder="ex: 98"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Consultations;
