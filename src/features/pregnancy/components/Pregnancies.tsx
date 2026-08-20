import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { SelectButton } from 'primereact/selectbutton';
import { Dropdown } from 'primereact/dropdown';
import DataTableSkeleton from '@/components/skeletons/DataTableSkeleton';
import { usePregnancyList } from '@/features/pregnancy/hooks/usePregnancyList';
import {
    RISK_LEVEL_OPTIONS,
    RISK_LEVEL_SEVERITY,
    PREGNANCY_STATUS_OPTIONS,
    PREGNANCY_STATUS_SEVERITY,
    ALERT_SEVERITY_TAG,
} from '@/features/pregnancy/utils/pregnancy.constants';
import type { Pregnancy, PregnancyMinimal } from '@/types';

const Pregnancies: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        filter, setFilter, params, setParams,
        pregnancies, activeList, dueSoonList, alertFeed,
        pagination, loading, toast, reload,
    } = usePregnancyList();

    const headers = [
        t('pregnancy.headers.reference'), t('pregnancy.headers.patient'), t('pregnancy.headers.edd'),
        t('pregnancy.headers.gestationalAge'), t('pregnancy.headers.status'), t('pregnancy.headers.riskLevel'),
    ];

    const filterOptions = [
        { label: t('pregnancy.filters.all'), value: 'all' },
        { label: t('pregnancy.filters.active'), value: 'active' },
        { label: t('pregnancy.filters.dueSoon'), value: 'dueSoon' },
        { label: t('pregnancy.filters.alerts'), value: 'alerts' },
    ];

    const riskTemplate = (riskLevel: string) => (
        <Tag value={t(`pregnancy.enums.riskLevel.${riskLevel}`)} severity={RISK_LEVEL_SEVERITY[riskLevel as keyof typeof RISK_LEVEL_SEVERITY]} />
    );

    const statusTemplate = (status: string) => (
        <Tag value={t(`pregnancy.enums.status.${status}`)} severity={PREGNANCY_STATUS_SEVERITY[status as keyof typeof PREGNANCY_STATUS_SEVERITY]} />
    );

    const patientName = (p: Pregnancy | PregnancyMinimal) => p.patient?.fullName || `${p.patient?.firstName ?? ''} ${p.patient?.lastName ?? ''}`.trim();

    const renderAllTable = () => (
        <DataTable
            value={pregnancies}
            paginator
            rows={pagination.limit}
            totalRecords={pagination.total}
            lazy
            first={(pagination.page - 1) * pagination.limit}
            onPage={(e) => setParams({ ...params, page: (e.page ?? 0) + 1, limit: e.rows })}
            emptyMessage={t('pregnancy.noPregnancies')}
            className="shadow-2"
            selectionMode="single"
            onRowClick={(e) => navigate(`/pregnancies/${(e.data as Pregnancy).id}`)}
            rowClassName={() => 'cursor-pointer'}
        >
            <Column field="referenceNumber" header={t('pregnancy.headers.reference')} />
            <Column header={t('pregnancy.headers.patient')} body={(row: Pregnancy) => patientName(row)} />
            <Column field="edd" header={t('pregnancy.headers.edd')} body={(row: Pregnancy) => new Date(row.edd).toLocaleDateString('fr-FR')} />
            <Column header={t('pregnancy.headers.gestationalAge')} body={(row: Pregnancy) => row.gestationalAge?.text} />
            <Column header={t('pregnancy.headers.status')} body={(row: Pregnancy) => statusTemplate(row.status)} />
            <Column header={t('pregnancy.headers.riskLevel')} body={(row: Pregnancy) => riskTemplate(row.riskLevel)} />
        </DataTable>
    );

    const renderMinimalTable = (list: PregnancyMinimal[]) => (
        <DataTable
            value={list}
            paginator
            rows={10}
            emptyMessage={t('pregnancy.noPregnancies')}
            className="shadow-2"
            selectionMode="single"
            onRowClick={(e) => navigate(`/pregnancies/${(e.data as PregnancyMinimal).id}`)}
            rowClassName={() => 'cursor-pointer'}
        >
            <Column field="referenceNumber" header={t('pregnancy.headers.reference')} />
            <Column header={t('pregnancy.headers.patient')} body={(row: PregnancyMinimal) => patientName(row)} />
            <Column field="edd" header={t('pregnancy.headers.edd')} body={(row: PregnancyMinimal) => new Date(row.edd).toLocaleDateString('fr-FR')} />
            <Column header={t('pregnancy.headers.status')} body={(row: PregnancyMinimal) => statusTemplate(row.status)} />
            <Column header={t('pregnancy.headers.riskLevel')} body={(row: PregnancyMinimal) => riskTemplate(row.riskLevel)} />
        </DataTable>
    );

    const renderAlertFeed = () => (
        <div className="flex flex-column gap-3">
            {alertFeed.length === 0 && (
                <div className="text-center text-500 py-6">{t('pregnancy.alerts.noAlerts')}</div>
            )}
            {alertFeed.map((item) => (
                <div
                    key={item.pregnancy.id}
                    className="p-3 border-round surface-card shadow-1 cursor-pointer"
                    onClick={() => navigate(`/pregnancies/${item.pregnancy.id}`)}
                >
                    <div className="flex justify-content-between align-items-center mb-2">
                        <div className="font-medium">{patientName(item.pregnancy)} — {item.pregnancy.referenceNumber}</div>
                        {riskTemplate(item.pregnancy.riskLevel)}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {item.alerts.map((alert, idx) => (
                            <Tag key={idx} value={alert.message} severity={ALERT_SEVERITY_TAG[alert.severity]} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div>
            <Toast ref={toast} />

            <div className="flex justify-content-between align-items-center mb-4">
                <h1 className="text-3xl font-bold m-0">{t('pregnancy.title')}</h1>
                <Button
                    label={t('pregnancy.newPregnancy')}
                    icon="pi pi-plus"
                    className="p-button-success"
                    onClick={() => navigate('/pregnancies/new')}
                />
            </div>

            <div className="flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <SelectButton value={filter} onChange={(e) => e.value && setFilter(e.value)} options={filterOptions} />
                <div className="flex gap-2">
                    {filter === 'all' && (
                        <>
                            <Dropdown
                                value={params.status || null}
                                options={PREGNANCY_STATUS_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))}
                                onChange={(e) => setParams({ ...params, status: e.value, page: 1 })}
                                placeholder={t('pregnancy.headers.status')}
                                showClear
                            />
                            <Dropdown
                                value={params.riskLevel || null}
                                options={RISK_LEVEL_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))}
                                onChange={(e) => setParams({ ...params, riskLevel: e.value, page: 1 })}
                                placeholder={t('pregnancy.headers.riskLevel')}
                                showClear
                            />
                        </>
                    )}
                    <Button icon="pi pi-refresh" className="p-button-secondary" onClick={reload} />
                </div>
            </div>

            {loading ? (
                <DataTableSkeleton headers={headers} />
            ) : filter === 'all' ? (
                renderAllTable()
            ) : filter === 'active' ? (
                renderMinimalTable(activeList)
            ) : filter === 'dueSoon' ? (
                renderMinimalTable(dueSoonList)
            ) : (
                renderAlertFeed()
            )}
        </div>
    );
};

export default Pregnancies;
