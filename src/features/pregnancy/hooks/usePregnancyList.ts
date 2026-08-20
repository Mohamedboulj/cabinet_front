import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Toast } from 'primereact/toast';
import { pregnancyService, type PregnancyListParams } from '@/features/pregnancy/api/pregnancy.api';
import type { Pregnancy, PregnancyMinimal, PregnancyAlertFeedItem } from '@/types';

export type PregnancyListFilter = 'all' | 'active' | 'dueSoon' | 'alerts';

export const usePregnancyList = () => {
    const { t } = useTranslation();
    const toast = useRef<Toast>(null);
    const [filter, setFilter] = useState<PregnancyListFilter>('all');
    const [params, setParams] = useState<PregnancyListParams>({ page: 1, limit: 20 });
    const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
    const [activeList, setActiveList] = useState<PregnancyMinimal[]>([]);
    const [dueSoonList, setDueSoonList] = useState<PregnancyMinimal[]>([]);
    const [alertFeed, setAlertFeed] = useState<PregnancyAlertFeedItem[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            if (filter === 'active') {
                const res = await pregnancyService.getActivePregnancies();
                setActiveList(res.data);
            } else if (filter === 'dueSoon') {
                const res = await pregnancyService.getDueSoon();
                setDueSoonList(res.data);
            } else if (filter === 'alerts') {
                const res = await pregnancyService.getAlertsInbox();
                setAlertFeed(res.data);
            } else {
                const res = await pregnancyService.getPregnancies(params);
                setPregnancies(res.data);
                if (res.pagination) setPagination(res.pagination);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: t('common.error'),
                detail: t('pregnancy.loadError'),
            });
        } finally {
            setLoading(false);
        }
    }, [filter, params, t]);

    useEffect(() => {
        load();
    }, [load]);

    return {
        filter,
        setFilter,
        params,
        setParams,
        pregnancies,
        activeList,
        dueSoonList,
        alertFeed,
        pagination,
        loading,
        toast,
        reload: load,
    };
};
