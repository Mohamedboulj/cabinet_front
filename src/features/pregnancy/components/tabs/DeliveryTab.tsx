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
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { deliveryService, type DeliveryPayload, type NewbornPayload } from '@/features/pregnancy/api/delivery.api';
import { getApiErrorMessage } from '@/utils/errorUtils';
import {
    DELIVERY_MODE_OPTIONS, DELIVERY_ANESTHESIA_OPTIONS, DELIVERY_OUTCOME_OPTIONS,
    NEWBORN_SEX_OPTIONS, FEEDING_TYPE_OPTIONS,
} from '@/features/pregnancy/utils/pregnancy.constants';
import type { Pregnancy, Newborn } from '@/types';

interface Props {
    pregnancy: Pregnancy;
    onReload: () => void;
}

const emptyNewborn: NewbornPayload = { sex: 'F', weightGrams: 3000, isAlive: true };

const DeliveryTab: React.FC<Props> = ({ pregnancy, onReload }) => {
    const { t } = useTranslation();
    const toast = useRef<Toast>(null);
    const delivery = pregnancy.deliveryRecord;

    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<DeliveryPayload>({ deliveryAt: '', mode: 'VAGINAL_SPONTANEOUS', gestationalWeeksAtBirth: 39, newborns: [{ ...emptyNewborn }] });
    const [submitting, setSubmitting] = useState(false);

    const [newbornDialogVisible, setNewbornDialogVisible] = useState(false);
    const [editingNewborn, setEditingNewborn] = useState<Newborn | null>(null);
    const [newbornForm, setNewbornForm] = useState<NewbornPayload>({ ...emptyNewborn });

    const openRecord = () => { setIsEditing(false); setFormData({ deliveryAt: '', mode: 'VAGINAL_SPONTANEOUS', gestationalWeeksAtBirth: 39, newborns: [{ ...emptyNewborn }] }); setDialogVisible(true); };
    const openEditDelivery = () => {
        if (!delivery) return;
        setIsEditing(true);
        setFormData({
            deliveryAt: delivery.deliveryAt, mode: delivery.mode, gestationalWeeksAtBirth: delivery.gestationalWeeksAtBirth,
            gestationalDaysAtBirth: delivery.gestationalDaysAtBirth ?? undefined, place: delivery.place ?? undefined,
            attendedBy: delivery.attendedBy ?? undefined, indication: delivery.indication ?? undefined,
            laborDurationMinutes: delivery.laborDurationMinutes ?? undefined, anesthesia: delivery.anesthesia ?? undefined,
            episiotomy: delivery.episiotomy ?? undefined, perinealTear: delivery.perinealTear ?? undefined,
            bloodLossMl: delivery.bloodLossMl ?? undefined, complications: delivery.complications ?? undefined, outcome: delivery.outcome,
        });
        setDialogVisible(true);
    };

    const handleSubmitDelivery = async () => {
        setSubmitting(true);
        try {
            if (isEditing) {
                await deliveryService.updateDelivery(pregnancy.id, formData);
                toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.delivery.updated') });
            } else {
                await deliveryService.createDelivery(pregnancy.id, formData);
                toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.delivery.created') });
            }
            setDialogVisible(false);
            onReload();
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDeleteDelivery = () => {
        confirmDialog({
            message: t('pregnancy.delivery.deleteConfirm'),
            header: t('common.confirmDelete'),
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await deliveryService.deleteDelivery(pregnancy.id);
                    toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.delivery.deleted') });
                    onReload();
                } catch (error) {
                    toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error, t('pregnancy.delivery.deleteError')) });
                }
            },
        });
    };

    const updateNewbornAt = (idx: number, patch: Partial<NewbornPayload>) => {
        const newborns = [...(formData.newborns || [])];
        newborns[idx] = { ...newborns[idx], ...patch };
        setFormData({ ...formData, newborns });
    };

    const addNewbornRow = () => setFormData({ ...formData, newborns: [...(formData.newborns || []), { ...emptyNewborn, birthOrder: (formData.newborns?.length || 0) + 1 }] });
    const removeNewbornRow = (idx: number) => setFormData({ ...formData, newborns: (formData.newborns || []).filter((_, i) => i !== idx) });

    const openAddNewborn = () => { setEditingNewborn(null); setNewbornForm({ ...emptyNewborn }); setNewbornDialogVisible(true); };
    const openEditNewborn = (nb: Newborn) => {
        setEditingNewborn(nb);
        setNewbornForm({
            birthOrder: nb.birthOrder, sex: nb.sex, weightGrams: nb.weightGrams, lengthCm: nb.lengthCm ? Number(nb.lengthCm) : undefined,
            headCircumferenceCm: nb.headCircumferenceCm ? Number(nb.headCircumferenceCm) : undefined, apgar1: nb.apgar1 ?? undefined,
            apgar5: nb.apgar5 ?? undefined, apgar10: nb.apgar10 ?? undefined, isAlive: nb.isAlive, resuscitationRequired: nb.resuscitationRequired ?? undefined,
            nicuAdmission: nb.nicuAdmission ?? undefined, feedingType: nb.feedingType ?? undefined, congenitalAnomalies: nb.congenitalAnomalies ?? undefined, notes: nb.notes ?? undefined,
        });
        setNewbornDialogVisible(true);
    };

    const handleSubmitNewborn = async () => {
        if (!delivery) return;
        setSubmitting(true);
        try {
            if (editingNewborn) {
                await deliveryService.updateNewborn(editingNewborn.id, newbornForm);
            } else {
                await deliveryService.addNewborn(delivery.id, newbornForm);
            }
            setNewbornDialogVisible(false);
            onReload();
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDeleteNewborn = (nb: Newborn) => {
        confirmDialog({
            message: t('pregnancy.delivery.deleteConfirm'),
            header: t('common.confirmDelete'),
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await deliveryService.deleteNewborn(nb.id);
                    toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.delivery.newbornDeleted') });
                    onReload();
                } catch (error) {
                    toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error, t('pregnancy.delivery.newbornDeleteError')) });
                }
            },
        });
    };

    return (
        <Card className="shadow-2">
            <Toast ref={toast} />
            <ConfirmDialog />

            {!delivery ? (
                <div className="text-center py-6">
                    <i className="pi pi-gift text-6xl text-500 mb-3 block"></i>
                    <p className="text-500 mb-3">{t('pregnancy.delivery.notDelivered')}</p>
                    <Button label={t('pregnancy.delivery.newDelivery')} icon="pi pi-plus" className="p-button-success" onClick={openRecord} />
                </div>
            ) : (
                <>
                    <div className="flex justify-content-between align-items-start mb-4">
                        <div className="grid w-full">
                            <div className="col-6 md:col-3"><div className="text-500 text-sm">{t('pregnancy.delivery.form.deliveryAt')}</div><div className="font-medium">{new Date(delivery.deliveryAt).toLocaleString('fr-FR')}</div></div>
                            <div className="col-6 md:col-3"><div className="text-500 text-sm">{t('pregnancy.delivery.form.mode')}</div><div className="font-medium">{t(`pregnancy.enums.deliveryMode.${delivery.mode}`)}</div></div>
                            <div className="col-6 md:col-3"><div className="text-500 text-sm">{t('pregnancy.delivery.headers.termCategory')}</div><Tag value={t(`pregnancy.enums.termCategory.${delivery.termCategory}`)} /></div>
                            <div className="col-6 md:col-3"><div className="text-500 text-sm">{t('pregnancy.delivery.form.outcome')}</div><div className="font-medium">{t(`pregnancy.enums.outcome.${delivery.outcome}`)}</div></div>
                        </div>
                        <div className="flex gap-2">
                            <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning p-button-sm" onClick={openEditDelivery} />
                            <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={confirmDeleteDelivery} />
                        </div>
                    </div>

                    <div className="flex justify-content-between align-items-center mb-2">
                        <h3 className="text-lg font-semibold m-0">{t('pregnancy.delivery.title')}</h3>
                        <Button label={t('pregnancy.delivery.addNewborn')} icon="pi pi-plus" className="p-button-sm p-button-success" onClick={openAddNewborn} />
                    </div>
                    <DataTable value={delivery.newborns || []}>
                        <Column field="birthOrder" header="#" style={{ width: '3rem' }} />
                        <Column header={t('pregnancy.delivery.newbornForm.sex')} body={(row: Newborn) => t(`pregnancy.enums.sex.${row.sex}`)} />
                        <Column header={t('pregnancy.delivery.newbornForm.weightGrams')} body={(row: Newborn) => `${row.weightGrams} g`} />
                        <Column header="Apgar" body={(row: Newborn) => `${row.apgar1 ?? '-'}/${row.apgar5 ?? '-'}/${row.apgar10 ?? '-'}`} />
                        <Column header={t('pregnancy.delivery.newbornForm.isAlive')} body={(row: Newborn) => <Tag value={row.isAlive ? t('common.yes') : t('common.no')} severity={row.isAlive ? 'success' : 'danger'} />} />
                        <Column
                            header={t('common.actions')}
                            body={(row: Newborn) => (
                                <div className="flex gap-2">
                                    <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning p-button-sm" onClick={() => openEditNewborn(row)} />
                                    <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => confirmDeleteNewborn(row)} />
                                </div>
                            )}
                        />
                    </DataTable>
                </>
            )}

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={isEditing ? t('pregnancy.delivery.editDelivery') : t('pregnancy.delivery.newDelivery')}
                className="w-11/12 md:w-9"
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label={t('common.cancel')} className="p-button-text" onClick={() => setDialogVisible(false)} />
                        <Button label={isEditing ? t('common.edit') : t('common.create')} icon="pi pi-check" loading={submitting} onClick={handleSubmitDelivery} />
                    </div>
                }
            >
                <div className="grid">
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.form.deliveryAt')}</label>
                        <Calendar value={formData.deliveryAt ? new Date(formData.deliveryAt) : null} onChange={(e) => setFormData({ ...formData, deliveryAt: e.value?.toISOString() || '' })} showTime dateFormat="dd/mm/yy" className="w-full" showIcon />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.form.mode')}</label>
                        <Dropdown value={formData.mode} options={DELIVERY_MODE_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, mode: e.value })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.form.gestationalWeeksAtBirth')}</label>
                        <InputNumber value={formData.gestationalWeeksAtBirth} onValueChange={(e) => setFormData({ ...formData, gestationalWeeksAtBirth: e.value ?? 0 })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.form.gestationalDaysAtBirth')}</label>
                        <InputNumber value={formData.gestationalDaysAtBirth ?? null} onValueChange={(e) => setFormData({ ...formData, gestationalDaysAtBirth: e.value ?? undefined })} className="w-full" min={0} max={6} />
                    </div>

                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.form.place')}</label>
                        <InputText value={formData.place || ''} onChange={(e) => setFormData({ ...formData, place: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.form.attendedBy')}</label>
                        <InputText value={formData.attendedBy || ''} onChange={(e) => setFormData({ ...formData, attendedBy: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.form.anesthesia')}</label>
                        <Dropdown value={formData.anesthesia || null} options={DELIVERY_ANESTHESIA_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, anesthesia: e.value })} className="w-full" showClear />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.form.outcome')}</label>
                        <Dropdown value={formData.outcome || 'LIVE_BIRTH'} options={DELIVERY_OUTCOME_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, outcome: e.value })} className="w-full" />
                    </div>

                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.form.laborDurationMinutes')}</label>
                        <InputNumber value={formData.laborDurationMinutes ?? null} onValueChange={(e) => setFormData({ ...formData, laborDurationMinutes: e.value ?? undefined })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.form.bloodLossMl')}</label>
                        <InputNumber value={formData.bloodLossMl ?? null} onValueChange={(e) => setFormData({ ...formData, bloodLossMl: e.value ?? undefined })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field flex align-items-center gap-2 mt-3">
                        <InputSwitch checked={!!formData.episiotomy} onChange={(e) => setFormData({ ...formData, episiotomy: e.value })} />
                        <label className="font-medium">{t('pregnancy.delivery.form.episiotomy')}</label>
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.form.perinealTear')}</label>
                        <InputText value={formData.perinealTear || ''} onChange={(e) => setFormData({ ...formData, perinealTear: e.target.value })} className="w-full" />
                    </div>

                    <div className="col-12 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.form.indication')}</label>
                        <InputText value={formData.indication || ''} onChange={(e) => setFormData({ ...formData, indication: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-12 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.form.complications')}</label>
                        <textarea className="w-full p-inputtextarea p-inputtext" rows={2} value={formData.complications || ''} onChange={(e) => setFormData({ ...formData, complications: e.target.value })} />
                    </div>

                    {!isEditing && (
                        <div className="col-12">
                            <div className="flex justify-content-between align-items-center mb-2">
                                <h4 className="m-0">{t('pregnancy.delivery.addNewborn')}</h4>
                                <Button icon="pi pi-plus" label={t('pregnancy.delivery.addNewborn')} className="p-button-sm" onClick={addNewbornRow} />
                            </div>
                            {(formData.newborns || []).map((nb, idx) => (
                                <div key={idx} className="grid align-items-end border-1 surface-border border-round p-2 mb-2">
                                    <div className="col-6 md:col-2 field">
                                        <label className="block text-sm mb-1">{t('pregnancy.delivery.newbornForm.sex')}</label>
                                        <Dropdown value={nb.sex} options={NEWBORN_SEX_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => updateNewbornAt(idx, { sex: e.value })} className="w-full" />
                                    </div>
                                    <div className="col-6 md:col-2 field">
                                        <label className="block text-sm mb-1">{t('pregnancy.delivery.newbornForm.weightGrams')}</label>
                                        <InputNumber value={nb.weightGrams} onValueChange={(e) => updateNewbornAt(idx, { weightGrams: e.value ?? 0 })} className="w-full" />
                                    </div>
                                    <div className="col-4 md:col-2 field">
                                        <label className="block text-sm mb-1">Apgar 1'</label>
                                        <InputNumber value={nb.apgar1 ?? null} onValueChange={(e) => updateNewbornAt(idx, { apgar1: e.value ?? undefined })} className="w-full" min={0} max={10} />
                                    </div>
                                    <div className="col-4 md:col-2 field">
                                        <label className="block text-sm mb-1">Apgar 5'</label>
                                        <InputNumber value={nb.apgar5 ?? null} onValueChange={(e) => updateNewbornAt(idx, { apgar5: e.value ?? undefined })} className="w-full" min={0} max={10} />
                                    </div>
                                    <div className="col-4 md:col-2 field flex align-items-center gap-2 mt-3">
                                        <InputSwitch checked={nb.isAlive !== false} onChange={(e) => updateNewbornAt(idx, { isAlive: e.value })} />
                                        <label className="text-sm">{t('pregnancy.delivery.newbornForm.isAlive')}</label>
                                    </div>
                                    <div className="col-2 flex justify-content-end">
                                        <Button icon="pi pi-times" className="p-button-rounded p-button-danger p-button-text" onClick={() => removeNewbornRow(idx)} disabled={(formData.newborns || []).length <= 1} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Dialog>

            <Dialog
                visible={newbornDialogVisible}
                onHide={() => setNewbornDialogVisible(false)}
                header={editingNewborn ? t('pregnancy.delivery.editNewborn') : t('pregnancy.delivery.addNewborn')}
                className="w-11/12 md:w-6"
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label={t('common.cancel')} className="p-button-text" onClick={() => setNewbornDialogVisible(false)} />
                        <Button label={editingNewborn ? t('common.edit') : t('common.create')} icon="pi pi-check" loading={submitting} onClick={handleSubmitNewborn} />
                    </div>
                }
            >
                <div className="grid">
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.newbornForm.sex')}</label>
                        <Dropdown value={newbornForm.sex} options={NEWBORN_SEX_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setNewbornForm({ ...newbornForm, sex: e.value })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.newbornForm.weightGrams')}</label>
                        <InputNumber value={newbornForm.weightGrams} onValueChange={(e) => setNewbornForm({ ...newbornForm, weightGrams: e.value ?? 0 })} className="w-full" />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.newbornForm.lengthCm')}</label>
                        <InputNumber value={newbornForm.lengthCm ?? null} onValueChange={(e) => setNewbornForm({ ...newbornForm, lengthCm: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={1} />
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.newbornForm.headCircumferenceCm')}</label>
                        <InputNumber value={newbornForm.headCircumferenceCm ?? null} onValueChange={(e) => setNewbornForm({ ...newbornForm, headCircumferenceCm: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={1} />
                    </div>
                    <div className="col-4 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.newbornForm.apgar1')}</label>
                        <InputNumber value={newbornForm.apgar1 ?? null} onValueChange={(e) => setNewbornForm({ ...newbornForm, apgar1: e.value ?? undefined })} className="w-full" min={0} max={10} />
                    </div>
                    <div className="col-4 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.newbornForm.apgar5')}</label>
                        <InputNumber value={newbornForm.apgar5 ?? null} onValueChange={(e) => setNewbornForm({ ...newbornForm, apgar5: e.value ?? undefined })} className="w-full" min={0} max={10} />
                    </div>
                    <div className="col-4 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.newbornForm.apgar10')}</label>
                        <InputNumber value={newbornForm.apgar10 ?? null} onValueChange={(e) => setNewbornForm({ ...newbornForm, apgar10: e.value ?? undefined })} className="w-full" min={0} max={10} />
                    </div>
                    <div className="col-6 md:col-3 field flex align-items-center gap-2 mt-3">
                        <InputSwitch checked={newbornForm.isAlive !== false} onChange={(e) => setNewbornForm({ ...newbornForm, isAlive: e.value })} />
                        <label className="font-medium">{t('pregnancy.delivery.newbornForm.isAlive')}</label>
                    </div>
                    <div className="col-6 md:col-3 field flex align-items-center gap-2 mt-3">
                        <InputSwitch checked={!!newbornForm.resuscitationRequired} onChange={(e) => setNewbornForm({ ...newbornForm, resuscitationRequired: e.value })} />
                        <label className="font-medium">{t('pregnancy.delivery.newbornForm.resuscitationRequired')}</label>
                    </div>
                    <div className="col-6 md:col-3 field flex align-items-center gap-2 mt-3">
                        <InputSwitch checked={!!newbornForm.nicuAdmission} onChange={(e) => setNewbornForm({ ...newbornForm, nicuAdmission: e.value })} />
                        <label className="font-medium">{t('pregnancy.delivery.newbornForm.nicuAdmission')}</label>
                    </div>
                    <div className="col-6 md:col-3 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.newbornForm.feedingType')}</label>
                        <Dropdown value={newbornForm.feedingType || null} options={FEEDING_TYPE_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setNewbornForm({ ...newbornForm, feedingType: e.value })} className="w-full" showClear />
                    </div>
                    <div className="col-12 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.newbornForm.congenitalAnomalies')}</label>
                        <InputText value={newbornForm.congenitalAnomalies || ''} onChange={(e) => setNewbornForm({ ...newbornForm, congenitalAnomalies: e.target.value })} className="w-full" />
                    </div>
                    <div className="col-12 field">
                        <label className="block font-medium mb-2">{t('pregnancy.delivery.newbornForm.notes')}</label>
                        <textarea className="w-full p-inputtextarea p-inputtext" rows={2} value={newbornForm.notes || ''} onChange={(e) => setNewbornForm({ ...newbornForm, notes: e.target.value })} />
                    </div>
                </div>
            </Dialog>
        </Card>
    );
};

export default DeliveryTab;
