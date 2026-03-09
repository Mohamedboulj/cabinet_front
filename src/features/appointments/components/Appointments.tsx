import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useAppointments } from '@/features/appointments/hooks/useAppointments';
import { AppointmentsList } from '@/features/appointments/components/AppointmentsList';

export const Appointments: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    appointments,
    loading,
    toast,
    confirmCancel,
    handleConfirm,
    handleComplete,
  } = useAppointments();

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

      <AppointmentsList
        appointments={appointments}
        loading={loading}
        onConfirm={handleConfirm}
        onComplete={handleComplete}
        onCancel={confirmCancel}
      />
    </div>
  );
};

export default Appointments;
