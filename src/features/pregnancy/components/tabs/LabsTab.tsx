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
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { labService, type ObstetricLabPayload } from '@/features/pregnancy/api/labs.api';
import { getApiErrorMessage } from '@/utils/errorUtils';
import { LAB_CATEGORY_OPTIONS, LAB_RESULT_OPTIONS, LAB_RESULT_SEVERITY } from '@/features/pregnancy/utils/pregnancy.constants';
import type { Pregnancy, ObstetricLab } from '@/types';

interface Props {
    pregnancy: Pregnancy;
    onReload: () => void;
}

const LabsTab: React.FC<Props> = ({ pregnancy, onReload }) => {
    const { t } = useTranslation();
    const toast = useRef<Toast>(null);
    const labs = pregnancy.labs || [];

    const [dialogVisible, setDialogVisible] = useState(false);
    const [editing, setEditing] = useState<ObstetricLab | null>(null);
    const [formData, setFormData] = useState<ObstetricLabPayload>({ category: 'OTHER', testCode: '', testName: '' });
    const [submitting, setSubmitting] = useState(false);
    const [prescribing, setPrescribing] = useState(false);

    const openNew = () => { setEditing(null); setFormData({ category: 'OTHER', testCode: '', testName: '', prescribedAt: new Date().toISOString().slice(0, 10) }); setDialogVisible(true); };
    const openEdit = (lab: ObstetricLab) => {
        setEditing(lab);
        setFormData({
            category: lab.category, testCode: lab.testCode, testName: lab.testName, prescribedAt: lab.prescribedAt ?? undefined,
            gestationalWeeks: lab.gestationalWeeks ?? undefined, value: lab.value ?? undefined, unit: lab.unit ?? undefined,
            referenceRange: lab.referenceRange ?? undefined, result: lab.result, resultAt: lab.resultAt ?? undefined,
            isCritical: lab.isCritical ?? undefined, notes: lab.notes ?? undefined,
        });
        setDialogVisible(true);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            if (editing) {
                await labService.updateLab(editing.id, formData);
                toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.labs.updated') });
            } else {
                await labService.createLab(pregnancy.id, formData);
                toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.labs.created') });
            }
            setDialogVisible(false);
            onReload();
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrescribePanel = async () => {
        setPrescribing(true);
        try {
            await labService.prescribePanel(pregnancy.id, pregnancy.trimester);
            toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.labs.prescribeSuccess') });
            onReload();
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error, t('pregnancy.labs.prescribeError')) });
        } finally {
            setPrescribing(false);
        }
    };

    const confirmDelete = (lab: ObstetricLab) => {
        confirmDialog({
            message: t('pregnancy.labs.deleteConfirm'),
            header: t('common.confirmDelete'),
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await labService.deleteLab(lab.id);
                    toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.labs.deleted') });
                    onReload();
                } catch (error) {
                    toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error, t('pregnancy.labs.deleteError')) });
                }
            },
        });
    };

    return (
        <Card className="shadow-2">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="flex justify-content-end gap-2 mb-3">
                <Button label={t('pregnancy.labs.prescribePanel')} icon="pi pi-list-check" className="p-button-info" onClick={handlePrescribePanel} loading={prescribing} />
                <Button label={t('pregnancy.labs.newLab')} icon="pi pi-plus" className="p-button-success" onClick={openNew} />
            </div>
            <DataTable value={labs} paginator rows={10} emptyMessage={t('pregnancy.labs.noLabs')}>
                <Column field="testName" header={t('pregnancy.labs.headers.test')} />
                <Column header={t('pregnancy.labs.headers.category')} body={(row: ObstetricLab) => t(`pregnancy.enums.labCategory.${row.category}`)} />
                <Column header={t('pregnancy.labs.headers.prescribedAt')} body={(row: ObstetricLab) => row.prescribedAt ? new Date(row.prescribedAt).toLocaleDateString('fr-FR') : '-'} />
                <Column header={t('pregnancy.labs.headers.result')} body={(row: ObstetricLab) => (
                    <div className="flex align-items-center gap-2">
                        <Tag value={t(`pregnancy.enums.labResult.${row.result}`)} severity={LAB_RESULT_SEVERITY[row.result]} />
                        {row.isCritical && <i className="pi pi-exclamation-triangle text-red-500" />}
                    </div>
                )} />
                <Column
                    header={t('pregnancy.labs.headers.actions')}
                    body={(row: ObstetricLab) => (
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
                header={editing ? t('pregnancy.labs.editLab') : t('pregnancy.labs.newLab')}
                className="w-11/12 md:w-7"
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label={t('common.cancel')} className="p-button-text" onClick={() => setDialogVisible(false)} />
                        <Button label={editing ? t('common.edit') : t('common.create')} icon="pi pi-check" loading={submitting} onClick={handleSubmit} />
                    </div>
                }
            >
                <div className="grid">
                    {!editing && (
                        <>
                            <div className="col-6 md:col-4 field">
                                <label className="block font-medium mb-2">{t('pregnancy.labs.form.category')}</label>
                                <Dropdown value={formData.category} options={LAB_CATEGORY_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, category: e.value })} className="w-full" />
                            </div>
                            <div className="col-6 md:col-4 field">
                                <label className="block font-medium mb-2">{t('pregnancy.labs.form.testCode')}</label>
                                <InputText value={formData.testCode} onChange={(e) => setFormData({ ...formData, testCode: e.target.value })} className="w-full" />
                            </div>
                            <div className="col-6 md:col-4 field">
                                <label className="block font-medium mb-2">{t('pregnancy.labs.form.testName')}</label>
                                <InputText value={formData.testName} onChange={(e) => setFormData({ ...formData, testName: e.target.value })} className="w-full" />
                            </div>
                            <div className="col-6 md:col-4 field">
                                <label className="block font-medium mb-2">{t('pregnancy.labs.form.prescribedAt')}</label>
                                <Calendar value={formData.prescribedAt ? new Date(formData.prescribedAt) : null} onChange={(e) => setFormData({ ...formData, prescribedAt: e.value?.toISOString().slice(0, 10) })} dateFormat="dd/mm/yy" className="w-full" showIcon />
                            </div>
                            <div className="col-6 md:col-4 field">
                                <label className="block font-medium mb-2">{t('pregnancy.labs.form.gestationalWeeks')}</label>
                                <InputText value={formData.gestationalWeeks?.toString() || ''} onChange={(e) => setFormData({ ...formData, gestationalWeeks: e.target.value ? Number(e.target.value) : undefined })} className="w-full" keyfilter="int" />
                            </div>
                        </>
                    )}
                    <div className="col-6 md:col-4 field">
                        <label className="block font-medium mb-2">{t('pregnancy.labs.form.value')}</label>
                        <InputText value={formData.value || ''} onChange={(e) => setFormData({ ...formData, value: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-4 field">
                        <label className="block font-medium mb-2">{t('pregnancy.labs.form.unit')}</label>
                        <InputText value={formData.unit || ''} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-4 field">
                        <label className="block font-medium mb-2">{t('pregnancy.labs.form.referenceRange')}</label>
                        <InputText value={formData.referenceRange || ''} onChange={(e) => setFormData({ ...formData, referenceRange: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-4 field">
                        <label className="block font-medium mb-2">{t('pregnancy.labs.form.result')}</label>
                        <Dropdown value={formData.result || 'PENDING'} options={LAB_RESULT_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, result: e.value })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-4 field">
                        <label className="block font-medium mb-2">{t('pregnancy.labs.form.resultAt')}</label>
                        <Calendar value={formData.resultAt ? new Date(formData.resultAt) : null} onChange={(e) => setFormData({ ...formData, resultAt: e.value?.toISOString().slice(0, 10) })} dateFormat="dd/mm/yy" className="w-full" showIcon />
                    </div>
                    <div className="col-6 md:col-4 field flex align-items-center gap-2 mt-3">
                        <InputSwitch checked={!!formData.isCritical} onChange={(e) => setFormData({ ...formData, isCritical: e.value })} />
                        <label className="font-medium">{t('pregnancy.labs.form.isCritical')}</label>
                    </div>
                    <div className="col-12 field">
                        <label className="block font-medium mb-2">{t('pregnancy.labs.form.notes')}</label>
                        <textarea className="w-full p-inputtextarea p-inputtext" rows={2} value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                    </div>
                </div>
            </Dialog>
        </Card>
    );
};

export default LabsTab;
