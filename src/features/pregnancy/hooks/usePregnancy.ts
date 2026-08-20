import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { pregnancyService } from '@/features/pregnancy/api/pregnancy.api';
import { getApiErrorMessage } from '@/utils/errorUtils';
import type { Pregnancy, PregnancyAlert, PregnancyStatus } from '@/types';

export const usePregnancy = (id: number) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);
    const [pregnancy, setPregnancy] = useState<Pregnancy | null>(null);
    const [alerts, setAlerts] = useState<PregnancyAlert[]>([]);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        try {
            setLoading(true);
            const [pregnancyRes, alertsRes] = await Promise.all([
                pregnancyService.getPregnancy(id),
                pregnancyService.getAlerts(id),
            ]);
            setPregnancy(pregnancyRes.data);
            setAlerts(alertsRes.data);
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: t('common.error'),
                detail: t('pregnancy.detail.loadError'),
            });
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        reload();
    }, [reload]);

    const handleClose = async (status?: PregnancyStatus, closureReason?: string) => {
        try {
            await pregnancyService.closePregnancy(id, status, closureReason);
            toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.closed') });
            reload();
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: t('common.error'),
                detail: getApiErrorMessage(error, t('pregnancy.closeError')),
            });
        }
    };

    const handleReopen = async () => {
        try {
            await pregnancyService.reopenPregnancy(id);
            toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.reopened') });
            reload();
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: t('common.error'),
                detail: getApiErrorMessage(error, t('pregnancy.reopenError')),
            });
        }
    };

    const handleDelete = async () => {
        try {
            await pregnancyService.deletePregnancy(id);
            toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.deleted') });
            navigate('/pregnancies');
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: t('common.error'),
                detail: getApiErrorMessage(error, t('pregnancy.deleteError')),
            });
        }
    };

    return {
        pregnancy,
        alerts,
        loading,
        toast,
        reload,
        handleClose,
        handleReopen,
        handleDelete,
    };
};
