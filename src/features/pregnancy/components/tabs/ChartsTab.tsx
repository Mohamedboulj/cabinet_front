import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import { pregnancyService } from '@/features/pregnancy/api/pregnancy.api';
import type { PregnancyChartData } from '@/types';

ChartJS.register(...registerables);

const ChartsTab: React.FC<{ pregnancyId: number }> = ({ pregnancyId }) => {
    const { t } = useTranslation();
    const [data, setData] = useState<PregnancyChartData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        pregnancyService.getChartData(pregnancyId)
            .then((res) => setData(res.data))
            .finally(() => setLoading(false));
    }, [pregnancyId]);

    if (loading) {
        return (
            <div className="grid">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="col-12 md:col-6">
                        <Card className="shadow-2"><Skeleton width="100%" height="16rem" /></Card>
                    </div>
                ))}
            </div>
        );
    }

    if (!data) return null;

    const weightLabels = data.weight.map((p) => p.week);
    const prePregWeight = data.prePregnancyWeight ? Number(data.prePregnancyWeight) : null;
    const weightChartData = {
        labels: weightLabels,
        datasets: [
            ...(data.weightCorridor && prePregWeight != null ? [
                {
                    label: 'min',
                    data: weightLabels.map(() => prePregWeight + (data.weightCorridor?.min || 0)),
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                    pointRadius: 0,
                    fill: false,
                },
                {
                    label: 'max',
                    data: weightLabels.map(() => prePregWeight + (data.weightCorridor?.max || 0)),
                    borderColor: 'transparent',
                    backgroundColor: 'rgba(59,130,246,0.15)',
                    pointRadius: 0,
                    fill: '-1',
                },
            ] : []),
            {
                label: t('pregnancy.charts.weightKg'),
                data: data.weight.map((p) => p.value),
                borderColor: '#3B82F6',
                backgroundColor: '#3B82F6',
                tension: 0.3,
            },
        ],
    };

    const bpChartData = {
        labels: data.bloodPressure.map((p) => p.week),
        datasets: [
            { label: 'Systolic', data: data.bloodPressure.map((p) => p.systolic), borderColor: '#EF4444', backgroundColor: '#EF4444', tension: 0.3 },
            { label: 'Diastolic', data: data.bloodPressure.map((p) => p.diastolic), borderColor: '#F59E0B', backgroundColor: '#F59E0B', tension: 0.3 },
        ],
    };

    const fundalHeightChartData = {
        labels: data.fundalHeight.map((p) => p.week),
        datasets: [{ label: t('pregnancy.charts.fundalHeight'), data: data.fundalHeight.map((p) => p.value), borderColor: '#10B981', backgroundColor: '#10B981', tension: 0.3 }],
    };

    const efwChartData = {
        labels: data.efw.map((p) => p.week),
        datasets: [{ label: t('pregnancy.charts.efw'), data: data.efw.map((p) => p.value), borderColor: '#8B5CF6', backgroundColor: '#8B5CF6', tension: 0.3 }],
    };

    const options = {
        plugins: { legend: { display: true } },
        scales: { x: { title: { display: true, text: t('pregnancy.charts.week') } } },
    };

    const renderChart = (title: string, chartData: any, points: number) => (
        <div className="col-12 md:col-6">
            <Card className="shadow-2" title={title}>
                {points === 0 ? (
                    <div className="text-center text-500 py-6">{t('pregnancy.charts.noData')}</div>
                ) : (
                    <Chart type="line" data={chartData} options={options} />
                )}
            </Card>
        </div>
    );

    return (
        <div className="grid">
            {renderChart(t('pregnancy.charts.weight'), weightChartData, data.weight.length)}
            {renderChart(t('pregnancy.charts.bloodPressure'), bpChartData, data.bloodPressure.length)}
            {renderChart(t('pregnancy.charts.fundalHeight'), fundalHeightChartData, data.fundalHeight.length)}
            {renderChart(t('pregnancy.charts.efw'), efwChartData, data.efw.length)}
        </div>
    );
};

export default ChartsTab;
