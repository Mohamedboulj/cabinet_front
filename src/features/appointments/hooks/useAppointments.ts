import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { appointmentService } from '@/features/appointments/api/appointments.api';
import { getApiErrorMessage } from '@/utils/errorUtils';
import type { Appointment } from '@/types';
import { Toast } from 'primereact/toast';
import { confirmDialog } from 'primereact/confirmdialog';

export const useAppointments = () => {
    const { t } = useTranslation();
    const toast = useRef<Toast>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAppointments = async () => {
        try {
            setLoading(true);
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

    useEffect(() => {
        loadAppointments();
    }, []);

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

    const confirmCancel = (appointment: Appointment) => {
        confirmDialog({
            message: t('appointments.cancelConfirm'),
            header: t('common.confirmation'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => handleCancel(appointment),
        });
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

    return {
        appointments,
        loading,
        toast,
        confirmCancel,
        handleConfirm,
        handleComplete,
    };
};
