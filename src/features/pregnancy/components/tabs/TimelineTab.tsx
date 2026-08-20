import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import { pregnancyService } from '@/features/pregnancy/api/pregnancy.api';
import type { PregnancyTimelineItem } from '@/types';

const TYPE_ICONS: Record<string, string> = {
    prenatal_visit: 'pi pi-heart',
    ultrasound: 'pi pi-image',
    lab: 'pi pi-list-check',
    delivery: 'pi pi-gift',
    postpartum_visit: 'pi pi-heart-fill',
    immunization: 'pi pi-shield',
    document: 'pi pi-file',
};

const TimelineTab: React.FC<{ pregnancyId: number }> = ({ pregnancyId }) => {
    const { t } = useTranslation();
    const [items, setItems] = useState<PregnancyTimelineItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        pregnancyService.getTimeline(pregnancyId)
            .then((res) => setItems(res.data))
            .finally(() => setLoading(false));
    }, [pregnancyId]);

    if (loading) {
        return (
            <Card className="shadow-2">
                <Skeleton width="100%" height="8rem" />
            </Card>
        );
    }

    if (items.length === 0) {
        return (
            <Card className="shadow-2">
                <div className="text-center text-500 py-4">{t('pregnancy.timeline.empty')}</div>
            </Card>
        );
    }

    return (
        <Card className="shadow-2">
            <div className="flex flex-column gap-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 align-items-start p-3 border-round surface-100">
                        <i className={`${TYPE_ICONS[item.type] || 'pi pi-circle'} text-primary text-xl`}></i>
                        <div className="flex-1">
                            <div className="flex justify-content-between">
                                <span className="font-medium capitalize">{item.type.replace(/_/g, ' ')}</span>
                                <span className="text-500 text-sm">{new Date(item.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default TimelineTab;
