import { useState, useEffect, useRef } from 'react';
import { prescriptionService } from '@/features/prescriptions/api/prescriptions.api';
import { consultationService } from '@/features/consultations/api/consultations.api';
import { medicamentService, type Medicament } from '@/features/prescriptions/api/medicaments.api';
import { getApiErrorMessage } from '@/utils/errorUtils';
import type { Prescription, PrescriptionMedication, Consultation } from '@/types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import DataTableSkeleton from '@/components/skeletons/DataTableSkeleton';
import { Dropdown } from 'primereact/dropdown';
import { AutoComplete } from 'primereact/autocomplete';
import { Checkbox } from 'primereact/checkbox';
import { useTranslation } from 'react-i18next';

const emptyMedication: PrescriptionMedication = {
  medicationName: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
  quantity: 1,
  pharmaceuticalForm: '',
};

const Prescriptions: React.FC = () => {
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [medications, setMedications] = useState<PrescriptionMedication[]>([{ ...emptyMedication }]);
  const [submitting, setSubmitting] = useState(false);

  // Medication autocomplete (shared — only one row's autocomplete is open at a time)
  const [medicamentSuggestions, setMedicamentSuggestions] = useState<Medicament[]>([]);

  useEffect(() => {
    loadPrescriptions();
    loadConsultations();
  }, []);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await prescriptionService.getPrescriptions();
      setPrescriptions(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('prescriptions.loadError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConsultations = async () => {
    try {
      const response = await consultationService.getConsultations();
      setConsultations(response.data);
    } catch (error) {
      // Silent fail
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPrescriptions();
      return;
    }
    setLoading(true);
    try {
      const response = await prescriptionService.getPrescriptions({ search: searchQuery });
      setPrescriptions(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('prescriptions.searchError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const searchMedicaments = async (event: { query: string }) => {
    try {
      const results = await medicamentService.searchMedicaments(event.query);
      setMedicamentSuggestions(results);
    } catch (error) {
      setMedicamentSuggestions([]);
    }
  };

  // Medication rows helpers
  const addMedication = () => setMedications([...medications, { ...emptyMedication }]);

  const removeMedication = (index: number) => {
    if (medications.length > 1) setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof PrescriptionMedication, value: any) => {
    const next = [...medications];
    next[index] = { ...next[index], [field]: value };
    setMedications(next);
  };

  const onMedicamentSelect = (index: number, med: Medicament) => {
    const next = [...medications];
    next[index] = {
      ...next[index],
      medicationName: med.nom,
      dosage: med.dosage1 ? `${med.dosage1} ${med.uniteDosage1 || ''}`.trim() : next[index].dosage,
      pharmaceuticalForm: med.forme || next[index].pharmaceuticalForm,
    };
    setMedications(next);
  };

  const openNewDialog = () => {
    setEditingPrescription(null);
    setMedications([{ ...emptyMedication }]);
    setFormData({
      isRenewable: false,
    });
    setDialogVisible(true);
  };

  const openEditDialog = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setMedications(
      prescription.medications && prescription.medications.length > 0
        ? prescription.medications.map((m) => ({ ...m }))
        : [{ ...emptyMedication }]
    );
    setFormData({
      consultationId: prescription.consultation?.id,
      isRenewable: prescription.isRenewable,
      renewalsCount: prescription.renewalsCount,
      notes: prescription.notes,
    });
    setDialogVisible(true);
  };

  const openViewDialog = (prescription: Prescription) => {
    setViewingPrescription(prescription);
    setViewDialogVisible(true);
  };

  const handleSubmit = async () => {
    // Keep only rows the user actually filled in (a medication name is the minimum)
    const filledMedications = medications.filter((m) => m.medicationName.trim() !== '');

    if (!formData.consultationId || filledMedications.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: t('common.warning'),
        detail: t('prescriptions.requiredFields'),
      });
      return;
    }

    // Each medication needs a frequency (backend requires it)
    if (filledMedications.some((m) => !m.frequency || m.frequency.trim() === '')) {
      toast.current?.show({
        severity: 'warn',
        summary: t('common.warning'),
        detail: t('prescriptions.medicationFrequencyRequired'),
      });
      return;
    }

    const payload: any = {
      consultationId: formData.consultationId,
      isRenewable: formData.isRenewable || false,
      renewalsCount: formData.renewalsCount,
      notes: formData.notes,
      medications: filledMedications,
    };

    setSubmitting(true);
    try {
      if (editingPrescription) {
        await prescriptionService.updatePrescription(editingPrescription.id, payload);
        toast.current?.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('prescriptions.updated'),
        });
      } else {
        await prescriptionService.createPrescription(payload);
        toast.current?.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('prescriptions.created'),
        });
      }
      setDialogVisible(false);
      await loadPrescriptions();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: getApiErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const medicationsSummary = (prescription: Prescription): string => {
    const meds = prescription.medications || [];
    if (meds.length === 0) return '—';
    const first = meds[0].medicationName;
    return meds.length > 1 ? `${first} (+${meds.length - 1})` : first;
  };

  const confirmDelete = (prescription: Prescription) => {
    confirmDialog({
      message: t('prescriptions.confirmDeleteMessage', { name: medicationsSummary(prescription) }),
      header: t('common.confirmDelete'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleDelete(prescription),
    });
  };

  const handleDelete = async (prescription: Prescription) => {
    try {
      await prescriptionService.deletePrescription(prescription.id);
      toast.current?.show({
        severity: 'success',
        summary: t('common.success'),
        detail: t('prescriptions.deleted'),
      });
      loadPrescriptions();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: getApiErrorMessage(error, t('prescriptions.deleteError')),
      });
    }
  };

  // Body templates
  const patientBodyTemplate = (rowData: Prescription) => {
    const patient = rowData.consultation?.patient;
    return patient ? `${patient.lastName} ${patient.firstName}` : '—';
  };

  const dateBodyTemplate = (rowData: Prescription) => {
    return new Date(rowData.createdAt).toLocaleDateString('fr-FR');
  };

  const medicationsBodyTemplate = (rowData: Prescription) => {
    const meds = rowData.medications || [];
    if (meds.length === 0) return <span>—</span>;
    return (
      <div className="flex align-items-center gap-2">
        <span>{meds[0].medicationName}</span>
        {meds.length > 1 && (
          <Tag value={`+${meds.length - 1}`} severity="info" rounded />
        )}
      </div>
    );
  };

  const renewableBodyTemplate = (rowData: Prescription) => {
    return rowData.isRenewable ? (
      <Tag value={t('prescriptions.renewable')} severity="success" />
    ) : (
      <Tag value={t('prescriptions.notRenewable')} severity="warning" />
    );
  };

  const actionBodyTemplate = (rowData: Prescription) => (
    <div className="flex gap-1">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-info p-button-sm"
        onClick={() => openViewDialog(rowData)}
        tooltip={t('common.view')}
      />
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-warning p-button-sm"
        onClick={() => openEditDialog(rowData)}
        tooltip={t('common.edit')}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-sm"
        onClick={() => confirmDelete(rowData)}
        tooltip={t('common.delete')}
      />
      <Button
        icon="pi pi-print"
        className="p-button-rounded p-button-secondary p-button-sm"
        tooltip={t('common.print')}
      />
    </div>
  );

  // Consultation dropdown template
  const consultationOptionTemplate = (option: Consultation) => {
    const patient = option.patient;
    const patientName = patient ? `${patient.lastName} ${patient.firstName}` : 'N/A';
    const date = new Date(option.createdAt).toLocaleDateString('fr-FR');
    return (
      <span>{option.referenceNumber} — {patientName} — {option.reason || t('prescriptions.form.noReason')} ({date})</span>
    );
  };

  const selectedConsultationTemplate = (value: any) => {
    if (!value) return <span>{t('prescriptions.form.selectConsultation')}</span>;
    // PrimeReact valueTemplate passes the full option object, not just the optionValue
    const consultation = typeof value === 'object'
      ? value as Consultation
      : consultations.find((c: Consultation) => c.id === value);
    if (!consultation) return <span>Consultation #{value}</span>;
    const patient = consultation.patient;
    const patientName = patient ? `${patient.lastName} ${patient.firstName}` : 'N/A';
    return <span>{consultation.referenceNumber} — {patientName} — {consultation.reason || t('prescriptions.form.noReason')}</span>;
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label={t('common.cancel')}
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setDialogVisible(false)}
      />
      <Button
        label={editingPrescription ? t('common.edit') : t('common.create')}
        icon="pi pi-check"
        loading={submitting}
        onClick={handleSubmit}
      />
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold m-0">{t('prescriptions.title')}</h1>
        <Button
          label={t('prescriptions.newPrescription')}
          icon="pi pi-plus"
          className="p-button-success"
          onClick={openNewDialog}
        />
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <span className="p-input-icon-left flex-1">
          <i className="pi pi-search" />
          <InputText
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('prescriptions.searchPlaceholder')}
            className="w-full"
            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          />
        </span>
        <Button icon="pi pi-search" onClick={handleSearch} />
        <Button icon="pi pi-refresh" className="p-button-secondary" onClick={loadPrescriptions} />
      </div>

      {/* Table */}
      {loading ? (
        <DataTableSkeleton headers={[t('prescriptions.headers.id'), t('prescriptions.headers.patient'), t('prescriptions.headers.medications'), t('prescriptions.headers.renewable'), t('prescriptions.headers.date'), t('prescriptions.headers.actions')]} />
      ) : (
        <DataTable
          value={prescriptions}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage={t('prescriptions.noPrescriptions')}
          className="shadow-2"
        >
          <Column field="id" header={t('prescriptions.headers.id')} sortable style={{ width: '5rem' }} />
          <Column header={t('prescriptions.headers.patient')} body={patientBodyTemplate} sortable />
          <Column header={t('prescriptions.headers.medications')} body={medicationsBodyTemplate} />
          <Column header={t('prescriptions.headers.renewable')} body={renewableBodyTemplate} style={{ width: '10rem' }} />
          <Column field="createdAt" header={t('prescriptions.headers.date')} body={dateBodyTemplate} sortable />
          <Column body={actionBodyTemplate} header={t('prescriptions.headers.actions')} style={{ width: '13rem' }} />
        </DataTable>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header={editingPrescription ? t('prescriptions.editDialog') : t('prescriptions.newDialog')}
        className="w-11/12 md:w-8 lg:w-8"
        footer={dialogFooter}
      >
        <div className="grid">
          {/* Consultation */}
          <div className="col-12 field">
            <label className="block font-medium mb-2">{t('prescriptions.form.consultation')}</label>
            <Dropdown
              value={formData.consultationId}
              options={consultations}
              optionLabel="reason"
              optionValue="id"
              onChange={(e) => setFormData({ ...formData, consultationId: e.value })}
              placeholder={t('prescriptions.form.selectConsultation')}
              className="w-full"
              filter
              filterPlaceholder={t('common.searchPlaceholder')}
              itemTemplate={consultationOptionTemplate}
              valueTemplate={selectedConsultationTemplate}
              disabled={!!editingPrescription}
            />
          </div>

          {/* Medications (one or more) */}
          <div className="col-12">
            <h3 className="text-lg font-semibold mb-3 mt-2">{t('prescriptions.form.medicationsTitle')}</h3>

            {medications.map((med, index) => (
              <div key={index} className="border-1 surface-border border-round p-3 mb-3">
                <div className="flex justify-content-between align-items-center mb-2">
                  <span className="font-medium text-600">{t('prescriptions.form.medicationN', { number: index + 1 })}</span>
                  <Button
                    icon="pi pi-minus"
                    className="p-button-rounded p-button-danger p-button-text p-button-sm"
                    onClick={() => removeMedication(index)}
                    disabled={medications.length === 1}
                    tooltip={t('prescriptions.form.removeMedication')}
                    type="button"
                  />
                </div>

                <div className="grid">
                  {/* Medication AutoComplete */}
                  <div className="col-12 md:col-6 field">
                    <label className="block font-medium mb-2">{t('prescriptions.form.medication')}</label>
                    <AutoComplete
                      value={med.medicationName}
                      suggestions={medicamentSuggestions}
                      completeMethod={searchMedicaments}
                      field="nom"
                      onChange={(e) => {
                        if (typeof e.value === 'string') {
                          updateMedication(index, 'medicationName', e.value);
                        } else if (e.value?.nom) {
                          updateMedication(index, 'medicationName', e.value.nom);
                        }
                      }}
                      onSelect={(e) => onMedicamentSelect(index, e.value as Medicament)}
                      placeholder={t('prescriptions.form.searchMedication')}
                      className="w-full"
                      dropdown
                      forceSelection={false}
                      itemTemplate={(item: Medicament) => (
                        <div>
                          <div className="font-semibold">{item.nom}</div>
                          <div className="text-sm text-500">{item.dci1} — {item.forme} — {item.dosage1} {item.uniteDosage1}</div>
                        </div>
                      )}
                    />
                  </div>

                  {/* Dosage */}
                  <div className="col-12 md:col-6 field">
                    <label className="block font-medium mb-2">{t('prescriptions.form.dosage')}</label>
                    <InputText
                      value={med.dosage || ''}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      className="w-full"
                      placeholder={t('prescriptions.form.dosagePlaceholder')}
                    />
                  </div>

                  {/* Pharmaceutical Form */}
                  <div className="col-12 md:col-6 field">
                    <label className="block font-medium mb-2">{t('prescriptions.form.pharmaceuticalForm')}</label>
                    <InputText
                      value={med.pharmaceuticalForm || ''}
                      onChange={(e) => updateMedication(index, 'pharmaceuticalForm', e.target.value)}
                      className="w-full"
                      placeholder={t('prescriptions.form.pharmaceuticalFormPlaceholder')}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-12 md:col-6 field">
                    <label className="block font-medium mb-2">{t('prescriptions.form.quantity')}</label>
                    <InputNumber
                      value={med.quantity}
                      onValueChange={(e) => updateMedication(index, 'quantity', e.value)}
                      className="w-full"
                      min={1}
                    />
                  </div>

                  {/* Frequency */}
                  <div className="col-12 md:col-6 field">
                    <label className="block font-medium mb-2">{t('prescriptions.form.frequency')}</label>
                    <InputText
                      value={med.frequency || ''}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      className="w-full"
                      placeholder={t('prescriptions.form.frequencyPlaceholder')}
                    />
                  </div>

                  {/* Duration */}
                  <div className="col-12 md:col-6 field">
                    <label className="block font-medium mb-2">{t('prescriptions.form.duration')}</label>
                    <InputText
                      value={med.duration || ''}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      className="w-full"
                      placeholder={t('prescriptions.form.durationPlaceholder')}
                    />
                  </div>

                  {/* Instructions */}
                  <div className="col-12 field">
                    <label className="block font-medium mb-2">{t('prescriptions.form.instructions')}</label>
                    <InputTextarea
                      value={med.instructions || ''}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                      className="w-full"
                      rows={3}
                      autoResize
                      placeholder={t('prescriptions.form.instructionsPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              label={t('prescriptions.form.addMedication')}
              icon="pi pi-plus"
              className="p-button-outlined p-button-sm"
              onClick={addMedication}
              type="button"
            />
          </div>

          {/* Is Renewable */}
          <div className="col-12 md:col-6 field">
            <div className="flex align-items-center gap-2 mt-3">
              <Checkbox
                inputId="isRenewable"
                checked={formData.isRenewable || false}
                onChange={(e) => setFormData({ ...formData, isRenewable: e.checked })}
              />
              <label htmlFor="isRenewable" className="font-medium cursor-pointer">{t('prescriptions.form.isRenewable')}</label>
            </div>
          </div>

          {/* Notes */}
          <div className="col-12 field">
            <label className="block font-medium mb-2">{t('prescriptions.form.notes')}</label>
            <InputTextarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full"
              rows={2}
              autoResize
              placeholder={t('prescriptions.form.notesPlaceholder')}
            />
          </div>
        </div>
      </Dialog>

      {/* View Dialog (read-only) */}
      <Dialog
        visible={viewDialogVisible}
        onHide={() => setViewDialogVisible(false)}
        header={t('prescriptions.viewDialog')}
        className="w-11/12 md:w-8 lg:w-8"
        footer={
          <div className="flex justify-content-end">
            <Button
              label={t('common.close')}
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setViewDialogVisible(false)}
            />
          </div>
        }
      >
        {viewingPrescription && (
          <div>
            {/* Header info */}
            <div className="grid mb-3">
              <div className="col-12 md:col-6">
                <div className="text-sm text-500">{t('prescriptions.headers.patient')}</div>
                <div className="font-medium">
                  {viewingPrescription.consultation?.patient
                    ? `${viewingPrescription.consultation.patient.lastName} ${viewingPrescription.consultation.patient.firstName}`
                    : '—'}
                </div>
              </div>
              <div className="col-12 md:col-6">
                <div className="text-sm text-500">{t('common.date')}</div>
                <div className="font-medium">
                  {new Date(viewingPrescription.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
              {viewingPrescription.consultation?.reason && (
                <div className="col-12">
                  <div className="text-sm text-500">{t('prescriptions.form.consultation')}</div>
                  <div className="font-medium">
                    {viewingPrescription.consultation.referenceNumber} — {viewingPrescription.consultation.reason}
                  </div>
                </div>
              )}
            </div>

            {/* Medications */}
            <h3 className="text-lg font-semibold mb-3">{t('prescriptions.form.medicationsTitle')}</h3>
            {(viewingPrescription.medications || []).map((med, index) => (
              <div key={med.id ?? index} className="border-1 surface-border border-round p-3 mb-3">
                <div className="font-semibold mb-2">{med.medicationName}</div>
                <div className="grid">
                  {med.dosage && (
                    <div className="col-12 md:col-6">
                      <div className="text-sm text-500">{t('prescriptions.form.dosage')}</div>
                      <div>{med.dosage}</div>
                    </div>
                  )}
                  {med.pharmaceuticalForm && (
                    <div className="col-12 md:col-6">
                      <div className="text-sm text-500">{t('prescriptions.form.pharmaceuticalForm')}</div>
                      <div>{med.pharmaceuticalForm}</div>
                    </div>
                  )}
                  {med.quantity != null && (
                    <div className="col-12 md:col-6">
                      <div className="text-sm text-500">{t('prescriptions.form.quantity')}</div>
                      <div>{med.quantity}</div>
                    </div>
                  )}
                  {med.frequency && (
                    <div className="col-12 md:col-6">
                      <div className="text-sm text-500">{t('prescriptions.form.frequency')}</div>
                      <div>{med.frequency}</div>
                    </div>
                  )}
                  {med.duration && (
                    <div className="col-12 md:col-6">
                      <div className="text-sm text-500">{t('prescriptions.form.duration')}</div>
                      <div>{med.duration}</div>
                    </div>
                  )}
                  {med.instructions && (
                    <div className="col-12">
                      <div className="text-sm text-500">{t('prescriptions.form.instructions')}</div>
                      <div>{med.instructions}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Footer info */}
            <div className="flex align-items-center gap-2 mt-3">
              {viewingPrescription.isRenewable ? (
                <Tag value={t('prescriptions.renewable')} severity="success" />
              ) : (
                <Tag value={t('prescriptions.notRenewable')} severity="warning" />
              )}
            </div>

            {viewingPrescription.notes && (
              <div className="mt-3">
                <div className="text-sm text-500">{t('prescriptions.form.notes')}</div>
                <div>{viewingPrescription.notes}</div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Prescriptions;
