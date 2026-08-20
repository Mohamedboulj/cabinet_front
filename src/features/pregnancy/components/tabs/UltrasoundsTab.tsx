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
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { ultrasoundService, type UltrasoundPayload } from '@/features/pregnancy/api/ultrasounds.api';
import { getApiErrorMessage } from '@/utils/errorUtils';
import {
    ULTRASOUND_TYPE_OPTIONS, AMNIOTIC_FLUID_OPTIONS, FETAL_PRESENTATION_OPTIONS,
} from '@/features/pregnancy/utils/pregnancy.constants';
import type { Pregnancy, Ultrasound } from '@/types';

interface Props {
    pregnancy: Pregnancy;
    onReload: () => void;
}

const UltrasoundsTab: React.FC<Props> = ({ pregnancy, onReload }) => {
    const { t } = useTranslation();
    const toast = useRef<Toast>(null);
    const ultrasounds = pregnancy.ultrasounds || [];

    const [dialogVisible, setDialogVisible] = useState(false);
    const [editing, setEditing] = useState<Ultrasound | null>(null);
    const [formData, setFormData] = useState<UltrasoundPayload>({ type: 'MORPHOLOGY' });
    const [submitting, setSubmitting] = useState(false);

    const openNew = () => { setEditing(null); setFormData({ type: 'MORPHOLOGY', performedAt: new Date().toISOString().slice(0, 10) }); setDialogVisible(true); };
    const openEdit = (us: Ultrasound) => {
        setEditing(us);
        setFormData({
            type: us.type, performedAt: us.performedAt, performedBy: us.performedBy ?? undefined, fetusLabel: us.fetusLabel ?? undefined,
            crl: us.crl ? Number(us.crl) : undefined, bpd: us.bpd ? Number(us.bpd) : undefined, hc: us.hc ? Number(us.hc) : undefined,
            ac: us.ac ? Number(us.ac) : undefined, fl: us.fl ? Number(us.fl) : undefined, efwPercentile: us.efwPercentile ?? undefined,
            nuchalTranslucency: us.nuchalTranslucency ? Number(us.nuchalTranslucency) : undefined,
            amnioticFluidIndex: us.amnioticFluidIndex ? Number(us.amnioticFluidIndex) : undefined, amnioticFluid: us.amnioticFluid ?? undefined,
            placentaLocation: us.placentaLocation ?? undefined, placentaGrade: us.placentaGrade ?? undefined, presentation: us.presentation ?? undefined,
            fetalHeartRate: us.fetalHeartRate ?? undefined, cervicalLength: us.cervicalLength ? Number(us.cervicalLength) : undefined,
            dopplerUmbilicalPi: us.dopplerUmbilicalPi ? Number(us.dopplerUmbilicalPi) : undefined, dopplerNotes: us.dopplerNotes ?? undefined,
            findings: us.findings ?? undefined, conclusion: us.conclusion ?? undefined, isNormal: us.isNormal ?? undefined,
        });
        setDialogVisible(true);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            let res;
            if (editing) {
                res = await ultrasoundService.updateUltrasound(editing.id, formData);
                toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.ultrasounds.updated') });
            } else {
                res = await ultrasoundService.createUltrasound(pregnancy.id, formData);
                toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.ultrasounds.created') });
            }
            if (res.data.efw && !formData.efw) {
                toast.current?.show({ severity: 'info', summary: 'EFW', detail: `${Number(res.data.efw)} g` });
            }
            setDialogVisible(false);
            onReload();
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (us: Ultrasound) => {
        confirmDialog({
            message: t('pregnancy.ultrasounds.deleteConfirm'),
            header: t('common.confirmDelete'),
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await ultrasoundService.deleteUltrasound(us.id);
                    toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.ultrasounds.deleted') });
                    onReload();
                } catch (error) {
                    toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error, t('pregnancy.ultrasounds.deleteError')) });
                }
            },
        });
    };

    const handleApplyDating = async (us: Ultrasound) => {
        try {
            await ultrasoundService.applyDating(us.id);
            toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.ultrasounds.applyDatingSuccess') });
            onReload();
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error, t('pregnancy.ultrasounds.applyDatingError')) });
        }
    };

    return (
        <Card className="shadow-2">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="flex justify-content-end mb-3">
                <Button label={t('pregnancy.ultrasounds.newUltrasound')} icon="pi pi-plus" className="p-button-success" onClick={openNew} />
            </div>
            <DataTable value={ultrasounds} paginator rows={10} emptyMessage={t('pregnancy.ultrasounds.noUltrasounds')}>
                <Column header={t('pregnancy.ultrasounds.headers.date')} body={(row: Ultrasound) => new Date(row.performedAt).toLocaleDateString('fr-FR')} />
                <Column header={t('pregnancy.ultrasounds.headers.type')} body={(row: Ultrasound) => t(`pregnancy.enums.ultrasoundType.${row.type}`)} />
                <Column header={t('pregnancy.ultrasounds.headers.ga')} body={(row: Ultrasound) => `${row.gestationalWeeks}+${row.gestationalDays}`} />
                <Column header={t('pregnancy.ultrasounds.headers.efw')} body={(row: Ultrasound) => row.efw ? `${Number(row.efw)} g` : '-'} />
                <Column field="conclusion" header={t('pregnancy.ultrasounds.headers.conclusion')} />
                <Column
                    header={t('pregnancy.ultrasounds.headers.actions')}
                    body={(row: Ultrasound) => (
                        <div className="flex gap-2">
                            <Button icon="pi pi-calendar" className="p-button-rounded p-button-info p-button-sm" tooltip={t('pregnancy.ultrasounds.applyDating')} onClick={() => handleApplyDating(row)} />
                            <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning p-button-sm" onClick={() => openEdit(row)} />
                            <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => confirmDelete(row)} />
                        </div>
                    )}
                />
            </DataTable>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={editing ? t('pregnancy.ultrasounds.editUltrasound') : t('pregnancy.ultrasounds.newUltrasound')}
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
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.type')}</label>
                        <Dropdown value={formData.type} options={ULTRASOUND_TYPE_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, type: e.value })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.performedAt')}</label>
                        <Calendar value={formData.performedAt ? new Date(formData.performedAt) : null} onChange={(e) => setFormData({ ...formData, performedAt: e.value?.toISOString().slice(0, 10) })} dateFormat="dd/mm/yy" className="w-full" showIcon />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.performedBy')}</label>
                        <InputText value={formData.performedBy || ''} onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.fetusLabel')}</label>
                        <InputText value={formData.fetusLabel || ''} onChange={(e) => setFormData({ ...formData, fetusLabel: e.target.value })} className="w-full" />
                    </div>

                    <div className="col-12">
                        <Message severity="info" text={t('pregnancy.ultrasounds.efwHint')} className="w-full mb-2" />
                    </div>
                    <div className="col-6 md:col-2 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.crl')}</label>
                        <InputNumber value={formData.crl ?? null} onValueChange={(e) => setFormData({ ...formData, crl: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={1} />
                    </div>
                    <div className="col-6 md:col-2 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.bpd')}</label>
                        <InputNumber value={formData.bpd ?? null} onValueChange={(e) => setFormData({ ...formData, bpd: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={1} />
                    </div>
                    <div className="col-6 md:col-2 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.hc')}</label>
                        <InputNumber value={formData.hc ?? null} onValueChange={(e) => setFormData({ ...formData, hc: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={1} />
                    </div>
                    <div className="col-6 md:col-2 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.ac')}</label>
                        <InputNumber value={formData.ac ?? null} onValueChange={(e) => setFormData({ ...formData, ac: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={1} />
                    </div>
                    <div className="col-6 md:col-2 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.fl')}</label>
                        <InputNumber value={formData.fl ?? null} onValueChange={(e) => setFormData({ ...formData, fl: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={1} />
                    </div>
                    <div className="col-6 md:col-2 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.efwPercentile')}</label>
                        <InputNumber value={formData.efwPercentile ?? null} onValueChange={(e) => setFormData({ ...formData, efwPercentile: e.value ?? undefined })} className="w-full" />
                    </div>

                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.nuchalTranslucency')}</label>
                        <InputNumber value={formData.nuchalTranslucency ?? null} onValueChange={(e) => setFormData({ ...formData, nuchalTranslucency: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={1} />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.amnioticFluidIndex')}</label>
                        <InputNumber value={formData.amnioticFluidIndex ?? null} onValueChange={(e) => setFormData({ ...formData, amnioticFluidIndex: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={1} />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.amnioticFluid')}</label>
                        <Dropdown value={formData.amnioticFluid || null} options={AMNIOTIC_FLUID_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, amnioticFluid: e.value })} className="w-full" showClear />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.presentation')}</label>
                        <Dropdown value={formData.presentation || null} options={FETAL_PRESENTATION_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, presentation: e.value })} className="w-full" showClear />
                    </div>

                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.placentaLocation')}</label>
                        <InputText value={formData.placentaLocation || ''} onChange={(e) => setFormData({ ...formData, placentaLocation: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.placentaGrade')}</label>
                        <InputText value={formData.placentaGrade || ''} onChange={(e) => setFormData({ ...formData, placentaGrade: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.fetalHeartRate')}</label>
                        <InputNumber value={formData.fetalHeartRate ?? null} onValueChange={(e) => setFormData({ ...formData, fetalHeartRate: e.value ?? undefined })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.cervicalLength')}</label>
                        <InputNumber value={formData.cervicalLength ?? null} onValueChange={(e) => setFormData({ ...formData, cervicalLength: e.value ?? undefined })} className="w-full" />
                    </div>

                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.dopplerUmbilicalPi')}</label>
                        <InputNumber value={formData.dopplerUmbilicalPi ?? null} onValueChange={(e) => setFormData({ ...formData, dopplerUmbilicalPi: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={2} />
                    </div>
                    <div className="col-6 md:col-9 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.dopplerNotes')}</label>
                        <InputText value={formData.dopplerNotes || ''} onChange={(e) => setFormData({ ...formData, dopplerNotes: e.target.value })} className="w-full" />
                    </div>

                    <div className="col-12 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.findings')}</label>
                        <textarea className="w-full p-inputtextarea p-inputtext" rows={2} value={formData.findings || ''} onChange={(e) => setFormData({ ...formData, findings: e.target.value })} />
                    </div>
                    <div className="col-12 md:col-9 field">
                        <label className="block font-medium mb-2">{t('pregnancy.ultrasounds.form.conclusion')}</label>
                        <textarea className="w-full p-inputtextarea p-inputtext" rows={2} value={formData.conclusion || ''} onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })} />
                    </div>
                    <div className="col-12 md:col-3 field flex align-items-center gap-2 mt-3">
                        <InputSwitch checked={!!formData.isNormal} onChange={(e) => setFormData({ ...formData, isNormal: e.value })} />
                        <label className="font-medium">{t('pregnancy.ultrasounds.form.isNormal')}</label>
                    </div>
                </div>
            </Dialog>
        </Card>
    );
};

export default UltrasoundsTab;
