import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { pregnancyService } from '@/features/pregnancy/api/pregnancy.api';
import { getApiErrorMessage } from '@/utils/errorUtils';
import { SCHEDULE_STATUS_SEVERITY } from '@/features/pregnancy/utils/pregnancy.constants';
import type { ScheduleMilestone, PregnancyStatus } from '@/types';

const ScheduleTab: React.FC<{ pregnancyId: number; pregnancyStatus: PregnancyStatus }> = ({ pregnancyId, pregnancyStatus }) => {
    const { t } = useTranslation();
    const toast = useRef<Toast>(null);
    const [milestones, setMilestones] = useState<ScheduleMilestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const load = useCallback(() => {
        setLoading(true);
        pregnancyService.getSchedule(pregnancyId)
            .then((res) => setMilestones(res.data))
            .finally(() => setLoading(false));
    }, [pregnancyId]);

    useEffect(() => { load(); }, [load]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await pregnancyService.generateSchedule(pregnancyId);
            toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.schedule.generateSuccess') });
            load();
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error, t('pregnancy.schedule.generateError')) });
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Card className="shadow-2">
            <Toast ref={toast} />
            <div className="flex justify-content-end mb-3">
                <Button
                    label={t('pregnancy.schedule.generate')}
                    icon="pi pi-calendar-plus"
                    onClick={handleGenerate}
                    loading={generating}
                    disabled={pregnancyStatus !== 'ONGOING'}
                />
            </div>
            {loading ? (
                <Skeleton width="100%" height="10rem" />
            ) : (
                <div className="flex flex-column gap-2">
                    {milestones.map((m, idx) => (
                        <div key={idx} className="flex justify-content-between align-items-center p-3 border-round surface-100">
                            <div>
                                <div className="font-medium">{m.label}</div>
                                <div className="text-500 text-sm">{new Date(m.targetDate).toLocaleDateString('fr-FR')} — {t('pregnancy.schedule.targetWeek', { week: m.targetWeek })}</div>
                            </div>
                            <Tag value={t(`pregnancy.enums.scheduleStatus.${m.status}`)} severity={SCHEDULE_STATUS_SEVERITY[m.status]} />
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default ScheduleTab;
