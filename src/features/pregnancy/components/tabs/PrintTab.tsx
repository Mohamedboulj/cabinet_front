import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { pregnancyService } from '@/features/pregnancy/api/pregnancy.api';
import type { PregnancyPrint } from '@/types';

const PrintTab: React.FC<{ pregnancyId: number }> = ({ pregnancyId }) => {
    const { t } = useTranslation();
    const [print, setPrint] = useState<PregnancyPrint | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        pregnancyService.getPrint(pregnancyId)
            .then((res: any) => setPrint('pregnancy' in res ? res : res.data))
            .finally(() => setLoading(false));
    }, [pregnancyId]);

    if (loading) {
        return <Card className="shadow-2"><Skeleton width="100%" height="20rem" /></Card>;
    }

    if (!print) return null;

    const { pregnancy, visits, ultrasounds } = print;

    return (
        <Card className="shadow-2">
            <div className="flex justify-content-end mb-3">
                <Button label={t('common.print')} icon="pi pi-print" onClick={() => window.print()} />
            </div>
            <div className="grid mb-4">
                <div className="col-12 md:col-6">
                    <h3 className="text-lg font-semibold">{pregnancy.referenceNumber}</h3>
                    <div><strong>{t('pregnancy.print.patient')}:</strong> {pregnancy.patient.name} ({pregnancy.patient.age} {t('patients.years')})</div>
                    <div><strong>{t('pregnancy.print.doctor')}:</strong> {pregnancy.doctor}</div>
                    <div><strong>{t('pregnancy.headers.lmp')}:</strong> {pregnancy.lmp}</div>
                    <div><strong>{t('pregnancy.headers.edd')}:</strong> {pregnancy.edd}</div>
                    <div><strong>{t('pregnancy.headers.gestationalAge')}:</strong> {pregnancy.gestationalAge}</div>
                </div>
                <div className="col-12 md:col-6">
                    <div><strong>{t('pregnancy.wizard.gravida')}/{t('pregnancy.wizard.para')}:</strong> G{pregnancy.gravida}P{pregnancy.para}</div>
                    <div><strong>{t('pregnancy.wizard.bloodGroup')}:</strong> {pregnancy.bloodGroup || '-'} {pregnancy.rhesus || ''}</div>
                    <div><strong>{t('pregnancy.headers.riskLevel')}:</strong> {t(`pregnancy.enums.riskLevel.${pregnancy.riskLevel}`)}</div>
                    <div><strong>{t('pregnancy.wizard.riskFactors')}:</strong> {pregnancy.riskFactors?.join(', ') || '-'}</div>
                </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">{t('pregnancy.print.visitsTitle')}</h3>
            <DataTable value={visits} className="mb-4" emptyMessage={t('pregnancy.visits.noVisits')}>
                <Column field="date" header={t('common.date')} />
                <Column field="gestationalAge" header={t('pregnancy.headers.gestationalAge')} />
                <Column field="weight" header={t('pregnancy.visits.headers.weight')} />
                <Column field="bloodPressure" header={t('pregnancy.visits.headers.bp')} />
                <Column field="fundalHeight" header={t('pregnancy.visits.form.fundalHeight')} />
                <Column field="fetalHeartRate" header={t('pregnancy.visits.headers.fhr')} />
            </DataTable>

            <h3 className="text-lg font-semibold mb-2">{t('pregnancy.print.ultrasoundsTitle')}</h3>
            <DataTable value={ultrasounds} emptyMessage={t('pregnancy.ultrasounds.noUltrasounds')}>
                <Column field="date" header={t('common.date')} />
                <Column header={t('pregnancy.ultrasounds.headers.type')} body={(row) => t(`pregnancy.enums.ultrasoundType.${row.type}`)} />
                <Column field="efw" header={t('pregnancy.ultrasounds.headers.efw')} />
                <Column field="conclusion" header={t('pregnancy.ultrasounds.headers.conclusion')} />
            </DataTable>
        </Card>
    );
};

export default PrintTab;
