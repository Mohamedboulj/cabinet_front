import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Appointment } from '@/types';
import { formatAppointmentDate } from '@/features/appointments/utils/appointments.utils';
import { AppointmentStatusTag } from '@/features/appointments/components/AppointmentStatusTag';
import { AppointmentActions } from '@/features/appointments/components/AppointmentActions';
import DataTableSkeleton from '@/components/skeletons/DataTableSkeleton';

interface Props {
    appointments: Appointment[];
    loading: boolean;
    onConfirm: (appointment: Appointment) => void;
    onComplete: (appointment: Appointment) => void;
    onCancel: (appointment: Appointment) => void;
}

export const AppointmentsList: React.FC<Props> = ({
    appointments,
    loading,
    onConfirm,
    onComplete,
    onCancel
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (loading) {
        return (
            <DataTableSkeleton
                headers={[
                    t('appointments.headers.patient'),
                    t('appointments.headers.doctor'),
                    t('appointments.headers.date'),
                    t('appointments.headers.reason'),
                    t('appointments.headers.type'),
                    t('appointments.headers.status'),
                    t('appointments.headers.actions')
                ]}
            />
        );
    }

    return (
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
            <Column field="startAt" header={t('appointments.headers.date')} body={(row: Appointment) => formatAppointmentDate(row.startAt)} sortable />
            <Column field="reason" header={t('appointments.headers.reason')} />
            <Column field="type" header={t('appointments.headers.type')} sortable />
            <Column field="status" header={t('appointments.headers.status')} body={(row: Appointment) => <AppointmentStatusTag status={row.status} />} sortable />
            <Column body={(row: Appointment) => <AppointmentActions appointment={row} onConfirm={onConfirm} onComplete={onComplete} onCancel={onCancel} />} header={t('appointments.headers.actions')} style={{ width: '10rem' }} />
        </DataTable>
    );
};
