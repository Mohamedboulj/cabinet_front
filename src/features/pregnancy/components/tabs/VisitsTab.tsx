import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { prenatalVisitService, type PrenatalVisitPayload } from '@/features/pregnancy/api/prenatalVisits.api';
import { getApiErrorMessage } from '@/utils/errorUtils';
import {
    FETAL_MOVEMENTS_OPTIONS, FETAL_PRESENTATION_OPTIONS, EDEMA_OPTIONS, PROTEINURIA_GLYCOSURIA_OPTIONS,
} from '@/features/pregnancy/utils/pregnancy.constants';
import type { Pregnancy, PrenatalVisit } from '@/types';

interface Props {
    pregnancy: Pregnancy;
    onReload: () => void;
}

const VisitsTab: React.FC<Props> = ({ pregnancy, onReload }) => {
    const { t } = useTranslation();
    const toast = useRef<Toast>(null);
    const visits = pregnancy.prenatalVisits || [];

    const [dialogVisible, setDialogVisible] = useState(false);
    const [editing, setEditing] = useState<PrenatalVisit | null>(null);
    const [formData, setFormData] = useState<PrenatalVisitPayload>({});
    const [submitting, setSubmitting] = useState(false);

    const openNew = () => { setEditing(null); setFormData({ visitDate: new Date().toISOString().slice(0, 10) }); setDialogVisible(true); };
    const openEdit = (visit: PrenatalVisit) => {
        setEditing(visit);
        setFormData({
            visitDate: visit.visitDate, weight: visit.weight ? Number(visit.weight) : undefined,
            bloodPressureSystolic: visit.bloodPressureSystolic ?? undefined, bloodPressureDiastolic: visit.bloodPressureDiastolic ?? undefined,
            fundalHeight: visit.fundalHeight ? Number(visit.fundalHeight) : undefined, fetalHeartRate: visit.fetalHeartRate ?? undefined,
            fetalMovements: visit.fetalMovements ?? undefined, fetalPresentation: visit.fetalPresentation ?? undefined,
            edema: visit.edema ?? undefined, proteinuria: visit.proteinuria ?? undefined, glycosuria: visit.glycosuria ?? undefined,
            uterineContractions: visit.uterineContractions ?? undefined, cervixExam: visit.cervixExam ?? undefined,
            complaints: visit.complaints ?? undefined, examination: visit.examination ?? undefined, diagnosis: visit.diagnosis ?? undefined,
            recommendations: visit.recommendations ?? undefined, notes: visit.notes ?? undefined, nextVisitDate: visit.nextVisitDate ?? undefined,
        });
        setDialogVisible(true);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            if (editing) {
                await prenatalVisitService.updateVisit(editing.id, formData);
                toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.visits.updated') });
            } else {
                await prenatalVisitService.createVisit(pregnancy.id, formData);
                toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.visits.created') });
            }
            setDialogVisible(false);
            onReload();
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (visit: PrenatalVisit) => {
        confirmDialog({
            message: t('pregnancy.visits.deleteConfirm'),
            header: t('common.confirmDelete'),
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await prenatalVisitService.deleteVisit(visit.id);
                    toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.visits.deleted') });
                    onReload();
                } catch (error) {
                    toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error, t('pregnancy.visits.deleteError')) });
                }
            },
        });
    };

    return (
        <Card className="shadow-2">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="flex justify-content-end mb-3">
                <Button label={t('pregnancy.visits.newVisit')} icon="pi pi-plus" className="p-button-success" onClick={openNew} />
            </div>
            <DataTable value={visits} paginator rows={10} emptyMessage={t('pregnancy.visits.noVisits')}>
                <Column field="visitNumber" header={t('pregnancy.visits.headers.visitNumber')} style={{ width: '4rem' }} />
                <Column header={t('pregnancy.visits.headers.date')} body={(row: PrenatalVisit) => new Date(row.visitDate).toLocaleDateString('fr-FR')} />
                <Column header={t('pregnancy.visits.headers.ga')} body={(row: PrenatalVisit) => `${row.gestationalWeeks}+${row.gestationalDays}`} />
                <Column header={t('pregnancy.visits.headers.weight')} body={(row: PrenatalVisit) => row.weight ? `${row.weight} kg` : '-'} />
                <Column header={t('pregnancy.visits.headers.bp')} body={(row: PrenatalVisit) => row.bloodPressureLabel || '-'} />
                <Column header={t('pregnancy.visits.headers.fhr')} body={(row: PrenatalVisit) => row.fetalHeartRate ?? '-'} />
                <Column
                    header={t('pregnancy.visits.headers.actions')}
                    body={(row: PrenatalVisit) => (
                        <div className="flex gap-2">
                            <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning p-button-sm" onClick={() => openEdit(row)} />
                            <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => confirmDelete(row)} />
                        </div>
                    )}
                />
            </DataTable>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={editing ? t('pregnancy.visits.editVisit') : t('pregnancy.visits.newVisit')}
                className="w-11/12 md:w-8"
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label={t('common.cancel')} className="p-button-text" onClick={() => setDialogVisible(false)} />
                        <Button label={editing ? t('common.edit') : t('common.create')} icon="pi pi-check" loading={submitting} onClick={handleSubmit} />
                    </div>
                }
            >
                <div className="grid">
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.visitDate')}</label>
                        <Calendar value={formData.visitDate ? new Date(formData.visitDate) : null} onChange={(e) => setFormData({ ...formData, visitDate: e.value?.toISOString().slice(0, 10) })} dateFormat="dd/mm/yy" className="w-full" showIcon />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.weight')}</label>
                        <InputNumber value={formData.weight ?? null} onValueChange={(e) => setFormData({ ...formData, weight: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={1} />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.bloodPressureSystolic')}</label>
                        <InputNumber value={formData.bloodPressureSystolic ?? null} onValueChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.value ?? undefined })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.bloodPressureDiastolic')}</label>
                        <InputNumber value={formData.bloodPressureDiastolic ?? null} onValueChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.value ?? undefined })} className="w-full" />
                    </div>

                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.fundalHeight')}</label>
                        <InputNumber value={formData.fundalHeight ?? null} onValueChange={(e) => setFormData({ ...formData, fundalHeight: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={1} />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.fetalHeartRate')}</label>
                        <InputNumber value={formData.fetalHeartRate ?? null} onValueChange={(e) => setFormData({ ...formData, fetalHeartRate: e.value ?? undefined })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.fetalMovements')}</label>
                        <Dropdown value={formData.fetalMovements || null} options={FETAL_MOVEMENTS_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, fetalMovements: e.value })} className="w-full" showClear />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.fetalPresentation')}</label>
                        <Dropdown value={formData.fetalPresentation || null} options={FETAL_PRESENTATION_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, fetalPresentation: e.value })} className="w-full" showClear />
                    </div>

                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.edema')}</label>
                        <Dropdown value={formData.edema || null} options={EDEMA_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, edema: e.value })} className="w-full" showClear />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.proteinuria')}</label>
                        <Dropdown value={formData.proteinuria || null} options={PROTEINURIA_GLYCOSURIA_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, proteinuria: e.value })} className="w-full" showClear />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.glycosuria')}</label>
                        <Dropdown value={formData.glycosuria || null} options={PROTEINURIA_GLYCOSURIA_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, glycosuria: e.value })} className="w-full" showClear />
                    </div>
                    <div className="col-6 md:col-3 field flex align-items-center gap-2 mt-3">
                        <InputSwitch checked={!!formData.uterineContractions} onChange={(e) => setFormData({ ...formData, uterineContractions: e.value })} />
                        <label className="font-medium">{t('pregnancy.visits.form.uterineContractions')}</label>
                    </div>

                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.cervixExam')}</label>
                        <input className="w-full p-inputtext" value={formData.cervixExam || ''} onChange={(e) => setFormData({ ...formData, cervixExam: e.target.value })} />
                    </div>
                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.nextVisitDate')}</label>
                        <Calendar value={formData.nextVisitDate ? new Date(formData.nextVisitDate) : null} onChange={(e) => setFormData({ ...formData, nextVisitDate: e.value?.toISOString().slice(0, 10) })} dateFormat="dd/mm/yy" className="w-full" showIcon />
                    </div>

                    <div className="col-12 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.complaints')}</label>
                        <textarea className="w-full p-inputtextarea p-inputtext" rows={2} value={formData.complaints || ''} onChange={(e) => setFormData({ ...formData, complaints: e.target.value })} />
                    </div>
                    <div className="col-12 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.examination')}</label>
                        <textarea className="w-full p-inputtextarea p-inputtext" rows={2} value={formData.examination || ''} onChange={(e) => setFormData({ ...formData, examination: e.target.value })} />
                    </div>
                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.diagnosis')}</label>
                        <textarea className="w-full p-inputtextarea p-inputtext" rows={2} value={formData.diagnosis || ''} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} />
                    </div>
                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.recommendations')}</label>
                        <textarea className="w-full p-inputtextarea p-inputtext" rows={2} value={formData.recommendations || ''} onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })} />
                    </div>
                    <div className="col-12 field">
                        <label className="block font-medium mb-2">{t('pregnancy.visits.form.notes')}</label>
                        <textarea className="w-full p-inputtextarea p-inputtext" rows={2} value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                    </div>
                </div>
            </Dialog>
        </Card>
    );
};

export default VisitsTab;
