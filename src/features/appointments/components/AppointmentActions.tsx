import React from 'react';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import type { Appointment } from '@/types';

interface Props {
    appointment: Appointment;
    onConfirm: (appointment: Appointment) => void;
    onComplete: (appointment: Appointment) => void;
    onCancel: (appointment: Appointment) => void;
}

export const AppointmentActions: React.FC<Props> = ({
    appointment,
    onConfirm,
    onComplete,
    onCancel,
}) => {
    const { t } = useTranslation();
    const canConfirm = appointment.status === 'SCHEDULED';
    const canComplete = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(appointment.status);
    const canCancel = ['SCHEDULED', 'CONFIRMED'].includes(appointment.status);

    return (
        <div className="flex gap-1">
            {canConfirm && (
                <Button
                    icon="pi pi-check"
                    className="p-button-rounded p-button-success p-button-sm"
                    onClick={() => onConfirm(appointment)}
                    tooltip={t('common.confirm')}
                />
            )}
            {canComplete && (
                <Button
                    icon="pi pi-check-circle"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => onComplete(appointment)}
                    tooltip={t('common.complete')}
                />
            )}
            {canCancel && (
                <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-danger p-button-sm"
                    onClick={() => onCancel(appointment)}
                    tooltip={t('common.cancel')}
                />
            )}
        </div>
    );
};
