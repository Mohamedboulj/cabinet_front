import { useState, useEffect, useRef } from 'react';
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
        summary: 'Erreur',
        detail: 'Impossible de charger les rendez-vous',
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = (appointment: Appointment) => {
    confirmDialog({
      message: `Êtes-vous sûr de vouloir annuler ce rendez-vous ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleCancel(appointment),
    });
  };

  const handleCancel = async (appointment: Appointment) => {
    try {
      await appointmentService.cancelAppointment(appointment.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Rendez-vous annulé',
      });
      loadAppointments();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: getApiErrorMessage(error, 'Impossible d\'annuler le rendez-vous'),
      });
    }
  };

  const handleConfirm = async (appointment: Appointment) => {
    try {
      await appointmentService.confirmAppointment(appointment.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Rendez-vous confirmé',
      });
      loadAppointments();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: getApiErrorMessage(error, 'Impossible de confirmer le rendez-vous'),
      });
    }
  };

  const handleComplete = async (appointment: Appointment) => {
    try {
      await appointmentService.completeAppointment(appointment.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Rendez-vous terminé',
      });
      loadAppointments();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: getApiErrorMessage(error, 'Impossible de terminer le rendez-vous'),
      });
    }
  };

  const statusBodyTemplate = (rowData: Appointment) => {
    const statusMap: Record<string, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' }> = {
      'SCHEDULED': { label: 'Planifié', severity: 'info' },
      'CONFIRMED': { label: 'Confirmé', severity: 'success' },
      'IN_PROGRESS': { label: 'En cours', severity: 'warning' },
      'COMPLETED': { label: 'Terminé', severity: 'success' },
      'CANCELLED': { label: 'Annulé', severity: 'danger' },
      'NO_SHOW': { label: 'Non présenté', severity: 'secondary' },
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
            tooltip="Confirmer"
          />
        )}
        {canComplete && (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-info p-button-sm"
            onClick={() => handleComplete(rowData)}
            tooltip="Terminer"
          />
        )}
        {canCancel && (
          <Button
            icon="pi pi-times"
            className="p-button-rounded p-button-danger p-button-sm"
            onClick={() => confirmCancel(rowData)}
            tooltip="Annuler"
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
        <h1 className="text-3xl font-bold m-0">Rendez-vous</h1>
        <div className="flex gap-2">
          <Button
            label="Calendrier"
            icon="pi pi-calendar"
            className="p-button-secondary"
            onClick={() => navigate('/calendar')}
          />
          <Button
            label="Nouveau RDV"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => navigate('/calendar', { state: { openNew: true } })}
          />
        </div>
      </div>

      {loading ? (
        <DataTableSkeleton headers={['ID', 'Patient', 'Médecin', 'Date', 'Motif', 'Type', 'Statut', 'Actions']} />
      ) : (
        <DataTable
          value={appointments}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage="Aucun rendez-vous trouvé"
          className="shadow-2"
        >
          <Column field="id" header="ID" sortable style={{ width: '5rem' }} />
          <Column field="patient.fullName" header="Patient" sortable />
          <Column field="doctor.fullName" header="Médecin" sortable />
          <Column field="startAt" header="Date" body={dateBodyTemplate} sortable />
          <Column field="reason" header="Motif" />
          <Column field="type" header="Type" sortable />
          <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
          <Column body={actionBodyTemplate} header="Actions" style={{ width: '10rem' }} />
        </DataTable>
      )}
    </div>
  );
};

export default Appointments;
