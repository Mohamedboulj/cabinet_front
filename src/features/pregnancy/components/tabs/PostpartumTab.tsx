import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { postpartumService, immunizationService, type PostpartumVisitPayload, type ImmunizationPayload } from '@/features/pregnancy/api/postpartum.api';
import { getApiErrorMessage } from '@/utils/errorUtils';
import { UTERINE_INVOLUTION_OPTIONS, LOCHIA_OPTIONS, IMMUNIZATION_TYPE_OPTIONS } from '@/features/pregnancy/utils/pregnancy.constants';
import type { Pregnancy, PostpartumVisit, PregnancyImmunization } from '@/types';

interface Props {
    pregnancy: Pregnancy;
    onReload: () => void;
}

const PostpartumTab: React.FC<Props> = ({ pregnancy, onReload }) => {
    const { t } = useTranslation();
    const toast = useRef<Toast>(null);
    const visits = pregnancy.postpartumVisits || [];
    const immunizations = pregnancy.immunizations || [];

    const [dialogVisible, setDialogVisible] = useState(false);
    const [editing, setEditing] = useState<PostpartumVisit | null>(null);
    const [formData, setFormData] = useState<PostpartumVisitPayload>({});
    const [submitting, setSubmitting] = useState(false);

    const [immDialogVisible, setImmDialogVisible] = useState(false);
    const [immForm, setImmForm] = useState<ImmunizationPayload>({ type: 'ANTI_D', administeredAt: new Date().toISOString().slice(0, 10) });

    const openNew = () => { setEditing(null); setFormData({ visitDate: new Date().toISOString().slice(0, 10) }); setDialogVisible(true); };
    const openEdit = (visit: PostpartumVisit) => {
        setEditing(visit);
        setFormData({
            visitDate: visit.visitDate, weight: visit.weight ? Number(visit.weight) : undefined,
            bloodPressureSystolic: visit.bloodPressureSystolic ?? undefined, bloodPressureDiastolic: visit.bloodPressureDiastolic ?? undefined,
            temperature: visit.temperature ? Number(visit.temperature) : undefined, uterineInvolution: visit.uterineInvolution ?? undefined,
            lochia: visit.lochia ?? undefined, perinealHealing: visit.perinealHealing ?? undefined, breastExam: visit.breastExam ?? undefined,
            breastfeedingStatus: visit.breastfeedingStatus ?? undefined, breastfeedingIssues: visit.breastfeedingIssues ?? undefined,
            edpsScore: visit.edpsScore ?? undefined, contraceptionCounseled: visit.contraceptionCounseled ?? undefined,
            contraceptionMethod: visit.contraceptionMethod ?? undefined, complications: visit.complications ?? undefined, notes: visit.notes ?? undefined,
        });
        setDialogVisible(true);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            if (editing) {
                await postpartumService.updateVisit(editing.id, formData);
                toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.postpartum.updated') });
            } else {
                await postpartumService.createVisit(pregnancy.id, formData);
                toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.postpartum.created') });
            }
            setDialogVisible(false);
            onReload();
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (visit: PostpartumVisit) => {
        confirmDialog({
            message: t('pregnancy.postpartum.deleteConfirm'),
            header: t('common.confirmDelete'),
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await postpartumService.deleteVisit(visit.id);
                    toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.postpartum.deleted') });
                    onReload();
                } catch (error) {
                    toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error, t('pregnancy.postpartum.deleteError')) });
                }
            },
        });
    };

    const handleAddImmunization = async () => {
        setSubmitting(true);
        try {
            await immunizationService.createImmunization(pregnancy.id, immForm);
            toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.postpartum.immunizationCreated') });
            setImmDialogVisible(false);
            onReload();
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDeleteImmunization = (imm: PregnancyImmunization) => {
        confirmDialog({
            message: t('pregnancy.postpartum.immunizationDeleteConfirm'),
            header: t('common.confirmDelete'),
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await immunizationService.deleteImmunization(imm.id);
                    toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.postpartum.immunizationDeleted') });
                    onReload();
                } catch (error) {
                    toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error, t('pregnancy.postpartum.immunizationDeleteError')) });
                }
            },
        });
    };

    return (
        <div className="flex flex-column gap-4">
            <Card className="shadow-2">
                <Toast ref={toast} />
                <ConfirmDialog />
                <div className="flex justify-content-between align-items-center mb-3">
                    <h3 className="text-lg font-semibold m-0">{t('pregnancy.postpartum.title')}</h3>
                    <Button label={t('pregnancy.postpartum.newVisit')} icon="pi pi-plus" className="p-button-success" onClick={openNew} />
                </div>
                <DataTable value={visits} paginator rows={10} emptyMessage={t('pregnancy.postpartum.noVisits')}>
                    <Column header={t('common.date')} body={(row: PostpartumVisit) => new Date(row.visitDate).toLocaleDateString('fr-FR')} />
                    <Column header={t('pregnancy.postpartum.form.uterineInvolution')} body={(row: PostpartumVisit) => row.uterineInvolution ? t(`pregnancy.enums.uterineInvolution.${row.uterineInvolution}`) : '-'} />
                    <Column header={t('pregnancy.postpartum.form.lochia')} body={(row: PostpartumVisit) => row.lochia ? t(`pregnancy.enums.lochia.${row.lochia}`) : '-'} />
                    <Column header={t('pregnancy.postpartum.form.edpsScore')} body={(row: PostpartumVisit) => (
                        <span className={row.edpsScore != null && row.edpsScore >= 13 ? 'text-red-600 font-bold' : ''}>{row.edpsScore ?? '-'}</span>
                    )} />
                    <Column
                        header={t('common.actions')}
                        body={(row: PostpartumVisit) => (
                            <div className="flex gap-2">
                                <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning p-button-sm" onClick={() => openEdit(row)} />
                                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => confirmDelete(row)} />
                            </div>
                        )}
                    />
                </DataTable>
            </Card>

            <Card className="shadow-2">
                <div className="flex justify-content-between align-items-center mb-3">
                    <h3 className="text-lg font-semibold m-0">{t('pregnancy.postpartum.immunizationsTitle')}</h3>
                    <Button label={t('pregnancy.postpartum.newImmunization')} icon="pi pi-plus" className="p-button-success" onClick={() => setImmDialogVisible(true)} />
                </div>
                {immunizations.length === 0 ? (
                    <div className="text-center text-500 py-3">{t('pregnancy.postpartum.noImmunizations')}</div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {immunizations.map((imm) => (
                            <Tag key={imm.id} className="p-2" value={`${t(`pregnancy.enums.immunizationType.${imm.type}`)} — ${new Date(imm.administeredAt).toLocaleDateString('fr-FR')}`} icon="pi pi-shield">
                                <Button icon="pi pi-times" className="p-button-text p-button-sm ml-2" onClick={() => confirmDeleteImmunization(imm)} />
                            </Tag>
                        ))}
                    </div>
                )}
            </Card>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={editing ? t('pregnancy.postpartum.editVisit') : t('pregnancy.postpartum.newVisit')}
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
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.visitDate')}</label>
                        <Calendar value={formData.visitDate ? new Date(formData.visitDate) : null} onChange={(e) => setFormData({ ...formData, visitDate: e.value?.toISOString().slice(0, 10) })} dateFormat="dd/mm/yy" className="w-full" showIcon />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.weight')}</label>
                        <InputNumber value={formData.weight ?? null} onValueChange={(e) => setFormData({ ...formData, weight: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={1} />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.bloodPressureSystolic')}</label>
                        <InputNumber value={formData.bloodPressureSystolic ?? null} onValueChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.value ?? undefined })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.bloodPressureDiastolic')}</label>
                        <InputNumber value={formData.bloodPressureDiastolic ?? null} onValueChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.value ?? undefined })} className="w-full" />
                    </div>

                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.temperature')}</label>
                        <InputNumber value={formData.temperature ?? null} onValueChange={(e) => setFormData({ ...formData, temperature: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={1} />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.uterineInvolution')}</label>
                        <Dropdown value={formData.uterineInvolution || null} options={UTERINE_INVOLUTION_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, uterineInvolution: e.value })} className="w-full" showClear />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.lochia')}</label>
                        <Dropdown value={formData.lochia || null} options={LOCHIA_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, lochia: e.value })} className="w-full" showClear />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.edpsScore')}</label>
                        <InputNumber value={formData.edpsScore ?? null} onValueChange={(e) => setFormData({ ...formData, edpsScore: e.value ?? undefined })} className="w-full" min={0} max={30} />
                    </div>

                    {formData.edpsScore != null && formData.edpsScore >= 13 && (
                        <div className="col-12">
                            <Message severity="warn" className="w-full" text={t('pregnancy.postpartum.edpsWarning')} />
                        </div>
                    )}

                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.perinealHealing')}</label>
                        <InputText value={formData.perinealHealing || ''} onChange={(e) => setFormData({ ...formData, perinealHealing: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.breastExam')}</label>
                        <InputText value={formData.breastExam || ''} onChange={(e) => setFormData({ ...formData, breastExam: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.breastfeedingStatus')}</label>
                        <InputText value={formData.breastfeedingStatus || ''} onChange={(e) => setFormData({ ...formData, breastfeedingStatus: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.breastfeedingIssues')}</label>
                        <InputText value={formData.breastfeedingIssues || ''} onChange={(e) => setFormData({ ...formData, breastfeedingIssues: e.target.value })} className="w-full" />
                    </div>

                    <div className="col-6 md:col-3 field flex align-items-center gap-2 mt-3">
                        <InputSwitch checked={!!formData.contraceptionCounseled} onChange={(e) => setFormData({ ...formData, contraceptionCounseled: e.value })} />
                        <label className="font-medium">{t('pregnancy.postpartum.form.contraceptionCounseled')}</label>
                    </div>
                    <div className="col-6 md:col-9 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.contraceptionMethod')}</label>
                        <InputText value={formData.contraceptionMethod || ''} onChange={(e) => setFormData({ ...formData, contraceptionMethod: e.target.value })} className="w-full" />
                    </div>

                    <div className="col-12 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.complications')}</label>
                        <textarea className="w-full p-inputtextarea p-inputtext" rows={2} value={formData.complications || ''} onChange={(e) => setFormData({ ...formData, complications: e.target.value })} />
                    </div>
                    <div className="col-12 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.form.notes')}</label>
                        <textarea className="w-full p-inputtextarea p-inputtext" rows={2} value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                    </div>
                </div>
            </Dialog>

            <Dialog
                visible={immDialogVisible}
                onHide={() => setImmDialogVisible(false)}
                header={t('pregnancy.postpartum.newImmunization')}
                className="w-11/12 md:w-5"
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label={t('common.cancel')} className="p-button-text" onClick={() => setImmDialogVisible(false)} />
                        <Button label={t('common.create')} icon="pi pi-check" loading={submitting} onClick={handleAddImmunization} />
                    </div>
                }
            >
                <div className="grid">
                    <div className="col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.immunizationForm.type')}</label>
                        <Dropdown value={immForm.type} options={IMMUNIZATION_TYPE_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setImmForm({ ...immForm, type: e.value })} className="w-full" />
                    </div>
                    <div className="col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.immunizationForm.administeredAt')}</label>
                        <Calendar value={immForm.administeredAt ? new Date(immForm.administeredAt) : null} onChange={(e) => setImmForm({ ...immForm, administeredAt: e.value?.toISOString().slice(0, 10) || '' })} dateFormat="dd/mm/yy" className="w-full" showIcon />
                    </div>
                    <div className="col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.immunizationForm.dose')}</label>
                        <InputText value={immForm.dose || ''} onChange={(e) => setImmForm({ ...immForm, dose: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.immunizationForm.batchNumber')}</label>
                        <InputText value={immForm.batchNumber || ''} onChange={(e) => setImmForm({ ...immForm, batchNumber: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-12 field">
                        <label className="block font-medium mb-2">{t('pregnancy.postpartum.immunizationForm.notes')}</label>
                        <textarea className="w-full p-inputtextarea p-inputtext" rows={2} value={immForm.notes || ''} onChange={(e) => setImmForm({ ...immForm, notes: e.target.value })} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default PostpartumTab;
