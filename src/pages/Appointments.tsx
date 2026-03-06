import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import { getApiErrorMessage } from '../utils/errorUtils';
import type { Appointment } from '../types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import DataTableSkeleton from '../components/skeletons/DataTableSkeleton';

const Appointments: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentService.getAppointments();
      setAppointments(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('appointments.loadError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = (appointment: Appointment) => {
    confirmDialog({
      message: t('appointments.cancelConfirm'),
      header: t('common.confirmation'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleCancel(appointment),
    });
  };

  const handleCancel = async (appointment: Appointment) => {
    try {
      await appointmentService.cancelAppointment(appointment.id);
      toast.current?.show({
        severity: 'success',
        summary: t('common.success'),
        detail: t('appointments.cancelled'),
      });
      loadAppointments();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: getApiErrorMessage(error, t('appointments.cancelError')),
      });
    }
  };

  const handleConfirm = async (appointment: Appointment) => {
    try {
      await appointmentService.confirmAppointment(appointment.id);
      toast.current?.show({
        severity: 'success',
        summary: t('common.success'),
        detail: t('appointments.confirmed'),
      });
      loadAppointments();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: getApiErrorMessage(error, t('appointments.confirmError')),
      });
    }
  };

  const handleComplete = async (appointment: Appointment) => {
    try {
      await appointmentService.completeAppointment(appointment.id);
      toast.current?.show({
        severity: 'success',
        summary: t('common.success'),
        detail: t('appointments.completed'),
      });
      loadAppointments();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: getApiErrorMessage(error, t('appointments.completeError')),
      });
    }
  };

  const statusBodyTemplate = (rowData: Appointment) => {
    const statusMap: Record<string, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' }> = {
      'SCHEDULED': { label: t('status.scheduled'), severity: 'info' },
      'CONFIRMED': { label: t('status.confirmed'), severity: 'success' },
      'IN_PROGRESS': { label: t('status.inProgress'), severity: 'warning' },
      'COMPLETED': { label: t('status.completed'), severity: 'success' },
      'CANCELLED': { label: t('status.cancelled'), severity: 'danger' },
      'NO_SHOW': { label: t('status.noShow'), severity: 'secondary' },
    };
    const status = statusMap[rowData.status] || { label: rowData.status, severity: 'info' };
    return <Tag value={status.label} severity={status.severity} />;
  };

  const dateBodyTemplate = (rowData: Appointment) => {
    return new Date(rowData.startAt).toLocaleString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const actionBodyTemplate = (rowData: Appointment) => {
    const canConfirm = rowData.status === 'SCHEDULED';
    const canComplete = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(rowData.status);
    const canCancel = ['SCHEDULED', 'CONFIRMED'].includes(rowData.status);

    return (
      <div className="flex gap-1">
        {canConfirm && (
          <Button
            icon="pi pi-check"
            className="p-button-rounded p-button-success p-button-sm"
            onClick={() => handleConfirm(rowData)}
            tooltip={t('common.confirm')}
          />
        )}
        {canComplete && (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-info p-button-sm"
            onClick={() => handleComplete(rowData)}
            tooltip={t('common.complete')}
          />
        )}
        {canCancel && (
          <Button
            icon="pi pi-times"
            className="p-button-rounded p-button-danger p-button-sm"
            onClick={() => confirmCancel(rowData)}
            tooltip={t('common.cancel')}
          />
        )}
      </div>
    );
  };

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold m-0">{t('appointments.title')}</h1>
        <div className="flex gap-2">
          <Button
            label={t('appointments.calendarBtn')}
            icon="pi pi-calendar"
            className="p-button-secondary"
            onClick={() => navigate('/calendar')}
          />
          <Button
            label={t('appointments.newAppointment')}
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => navigate('/calendar', { state: { openNew: true } })}
          />
        </div>
      </div>

      {loading ? (
        <DataTableSkeleton headers={[t('appointments.headers.patient'), t('appointments.headers.doctor'), t('appointments.headers.date'), t('appointments.headers.reason'), t('appointments.headers.type'), t('appointments.headers.status'), t('appointments.headers.actions')]} />
      ) : (
        <DataTable
          value={appointments}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage={t('appointments.noAppointments')}
          className="shadow-2"
          onRowClick={(e) => navigate(`/appointments/${e.data.id}`)}
          rowClassName={() => 'cursor-pointer'}
        >
          <Column field="patient.lastName" header={t('appointments.headers.patient')} body={(row: Appointment) => `${row.patient.firstName} ${row.patient.lastName}`} sortable />
          <Column field="doctor.lastName" header={t('appointments.headers.doctor')} body={(row: Appointment) => `${row.doctor.firstName} ${row.doctor.lastName}`} sortable />
          <Column field="startAt" header={t('appointments.headers.date')} body={dateBodyTemplate} sortable />
          <Column field="reason" header={t('appointments.headers.reason')} />
          <Column field="type" header={t('appointments.headers.type')} sortable />
          <Column field="status" header={t('appointments.headers.status')} body={statusBodyTemplate} sortable />
          <Column body={actionBodyTemplate} header={t('appointments.headers.actions')} style={{ width: '10rem' }} />
        </DataTable>
      )}
    </div>
  );
};

export default Appointments;
