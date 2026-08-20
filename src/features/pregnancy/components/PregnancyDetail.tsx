import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { usePregnancy } from '@/features/pregnancy/hooks/usePregnancy';
import PregnancyDetailSkeleton from '@/features/pregnancy/components/skeletons/PregnancyDetailSkeleton';
import {
    RISK_LEVEL_SEVERITY, PREGNANCY_STATUS_SEVERITY, CLOSURE_STATUS_OPTIONS,
} from '@/features/pregnancy/utils/pregnancy.constants';
import TimelineTab from '@/features/pregnancy/components/tabs/TimelineTab';
import ScheduleTab from '@/features/pregnancy/components/tabs/ScheduleTab';
import VisitsTab from '@/features/pregnancy/components/tabs/VisitsTab';
import UltrasoundsTab from '@/features/pregnancy/components/tabs/UltrasoundsTab';
import LabsTab from '@/features/pregnancy/components/tabs/LabsTab';
import DeliveryTab from '@/features/pregnancy/components/tabs/DeliveryTab';
import PostpartumTab from '@/features/pregnancy/components/tabs/PostpartumTab';
import ChartsTab from '@/features/pregnancy/components/tabs/ChartsTab';
import DocumentsTab from '@/features/pregnancy/components/tabs/DocumentsTab';
import PrintTab from '@/features/pregnancy/components/tabs/PrintTab';
import type { PregnancyStatus } from '@/types';

const PregnancyDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const pregnancyId = parseInt(id!, 10);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { pregnancy, alerts, loading, toast, reload, handleClose, handleReopen, handleDelete } = usePregnancy(pregnancyId);

    const [closeDialogVisible, setCloseDialogVisible] = useState(false);
    const [closeStatus, setCloseStatus] = useState<PregnancyStatus>('COMPLETED');
    const [closeReason, setCloseReason] = useState('');

    if (loading) return <PregnancyDetailSkeleton />;

    if (!pregnancy) {
        return (
            <div className="text-center py-8">
                <i className="pi pi-exclamation-circle text-6xl text-500 mb-4"></i>
                <h2 className="text-2xl font-semibold">{t('pregnancy.detail.notFound')}</h2>
                <Button label={t('common.backToList')} icon="pi pi-arrow-left" className="mt-4" onClick={() => navigate('/pregnancies')} />
            </div>
        );
    }

    const patientName = pregnancy.patient?.fullName || `${pregnancy.patient?.firstName ?? ''} ${pregnancy.patient?.lastName ?? ''}`.trim();
    const hasDelivery = !!pregnancy.deliveryRecord;

    const confirmDelete = () => {
        confirmDialog({
            message: t('pregnancy.deleteConfirm'),
            header: t('common.confirmDelete'),
            icon: 'pi pi-exclamation-triangle',
            accept: handleDelete,
        });
    };

    const submitClose = () => {
        handleClose(closeStatus, closeReason || undefined);
        setCloseDialogVisible(false);
    };

    return (
        <div>
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
                <div>
                    <Button label={t('common.back')} icon="pi pi-arrow-left" className="p-button-text mb-2" onClick={() => navigate('/pregnancies')} />
                    <div className="flex align-items-center gap-2 flex-wrap">
                        <h1 className="text-3xl font-bold m-0">{patientName}</h1>
                        <Tag value={pregnancy.referenceNumber} className="bg-primary-100 text-primary-700" />
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                        <Tag value={t(`pregnancy.enums.status.${pregnancy.status}`)} severity={PREGNANCY_STATUS_SEVERITY[pregnancy.status]} />
                        <Tag value={t(`pregnancy.enums.riskLevel.${pregnancy.riskLevel}`)} severity={RISK_LEVEL_SEVERITY[pregnancy.riskLevel]} />
                        <Tag icon="pi pi-clock" value={pregnancy.gestationalAge.text} className="bg-blue-100 text-blue-700" />
                        <Tag value={t('pregnancy.detail.gravidaPara', { gravida: pregnancy.gravida, para: pregnancy.para })} className="bg-100 text-700" />
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button icon="pi pi-print" label={t('common.print')} className="p-button-secondary" onClick={() => navigate(`/pregnancies/${pregnancyId}`, { state: { tab: 'print' } })} />
                    {pregnancy.status === 'ONGOING' ? (
                        <Button icon="pi pi-lock" label={t('pregnancy.close.title')} className="p-button-warning" onClick={() => setCloseDialogVisible(true)} />
                    ) : (
                        <Button icon="pi pi-lock-open" label={t('common.confirm')} className="p-button-info" onClick={handleReopen} />
                    )}
                    <Button icon="pi pi-trash" className="p-button-danger" onClick={confirmDelete} disabled={hasDelivery} tooltip={hasDelivery ? t('pregnancy.delivery.alreadyExists') : t('common.delete')} />
                </div>
            </div>

            {alerts.length > 0 && (
                <div className="flex flex-column gap-2 mb-4">
                    {alerts.map((alert, idx) => (
                        <Message key={idx} severity={alert.severity === 'CRITICAL' ? 'error' : alert.severity === 'WARNING' ? 'warn' : 'info'} text={alert.message} className="w-full justify-content-start" />
                    ))}
                </div>
            )}

            <div className="grid mb-4">
                <div className="col-6 md:col-3">
                    <Card className="shadow-2">
                        <div className="text-500 text-sm">{t('pregnancy.headers.edd')}</div>
                        <div className="font-medium text-xl">{new Date(pregnancy.edd).toLocaleDateString('fr-FR')}</div>
                        <div className="text-500 text-sm mt-1">
                            {pregnancy.daysRemaining >= 0
                                ? t('pregnancy.detail.dueIn', { count: pregnancy.daysRemaining })
                                : t('pregnancy.detail.overdue', { count: Math.abs(pregnancy.daysRemaining) })}
                        </div>
                    </Card>
                </div>
                <div className="col-6 md:col-3">
                    <Card className="shadow-2">
                        <div className="text-500 text-sm">{t('pregnancy.headers.trimester')}</div>
                        <div className="font-medium text-xl">{pregnancy.trimester}</div>
                    </Card>
                </div>
                <div className="col-6 md:col-3">
                    <Card className="shadow-2">
                        <div className="text-500 text-sm">{t('pregnancy.detail.bmi')}</div>
                        <div className="font-medium text-xl">{pregnancy.bmi ?? '-'}</div>
                    </Card>
                </div>
                <div className="col-6 md:col-3">
                    <Card className="shadow-2">
                        <div className="text-500 text-sm">{t('pregnancy.wizard.bloodGroup')}</div>
                        <div className="font-medium text-xl">{pregnancy.bloodGroup || '-'} {pregnancy.rhesus ? t(`pregnancy.enums.rhesus.${pregnancy.rhesus}`) : ''}</div>
                    </Card>
                </div>
            </div>

            <TabView>
                <TabPanel header={t('pregnancy.detail.tabs.timeline')} leftIcon="pi pi-history mr-2">
                    <TimelineTab pregnancyId={pregnancyId} />
                </TabPanel>
                <TabPanel header={t('pregnancy.detail.tabs.schedule')} leftIcon="pi pi-calendar mr-2">
                    <ScheduleTab pregnancyId={pregnancyId} pregnancyStatus={pregnancy.status} />
                </TabPanel>
                <TabPanel header={t('pregnancy.detail.tabs.visits')} leftIcon="pi pi-heart mr-2">
                    <VisitsTab pregnancy={pregnancy} onReload={reload} />
                </TabPanel>
                <TabPanel header={t('pregnancy.detail.tabs.ultrasounds')} leftIcon="pi pi-image mr-2">
                    <UltrasoundsTab pregnancy={pregnancy} onReload={reload} />
                </TabPanel>
                <TabPanel header={t('pregnancy.detail.tabs.labs')} leftIcon="pi pi-list-check mr-2">
                    <LabsTab pregnancy={pregnancy} onReload={reload} />
                </TabPanel>
                <TabPanel header={t('pregnancy.detail.tabs.delivery')} leftIcon="pi pi-gift mr-2">
                    <DeliveryTab pregnancy={pregnancy} onReload={reload} />
                </TabPanel>
                <TabPanel header={t('pregnancy.detail.tabs.postpartum')} leftIcon="pi pi-heart-fill mr-2">
                    <PostpartumTab pregnancy={pregnancy} onReload={reload} />
                </TabPanel>
                <TabPanel header={t('pregnancy.detail.tabs.charts')} leftIcon="pi pi-chart-line mr-2">
                    <ChartsTab pregnancyId={pregnancyId} />
                </TabPanel>
                <TabPanel header={t('pregnancy.detail.tabs.documents')} leftIcon="pi pi-file mr-2">
                    <DocumentsTab pregnancy={pregnancy} onReload={reload} />
                </TabPanel>
                <TabPanel header={t('pregnancy.detail.tabs.print')} leftIcon="pi pi-print mr-2">
                    <PrintTab pregnancyId={pregnancyId} />
                </TabPanel>
            </TabView>

            <Dialog
                visible={closeDialogVisible}
                onHide={() => setCloseDialogVisible(false)}
                header={t('pregnancy.close.title')}
                className="w-11/12 md:w-5"
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label={t('common.cancel')} className="p-button-text" onClick={() => setCloseDialogVisible(false)} />
                        <Button label={t('common.confirm')} icon="pi pi-check" onClick={submitClose} />
                    </div>
                }
            >
                <div className="field">
                    <label className="block font-medium mb-2">{t('pregnancy.close.status')}</label>
                    <Dropdown
                        value={closeStatus}
                        options={CLOSURE_STATUS_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))}
                        onChange={(e) => setCloseStatus(e.value)}
                        className="w-full"
                    />
                </div>
                <div className="field">
                    <label className="block font-medium mb-2">{t('pregnancy.close.reason')}</label>
                    <textarea value={closeReason} onChange={(e) => setCloseReason(e.target.value)} className="w-full p-inputtextarea p-inputtext" rows={3} />
                </div>
            </Dialog>
        </div>
    );
};

export default PregnancyDetail;
