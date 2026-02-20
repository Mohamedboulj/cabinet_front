import { useState, useEffect, useRef } from 'react';
import { prescriptionService } from '../services/prescriptionService';
import { consultationService } from '../services/consultationService';
import { medicamentService, type Medicament } from '../services/medicamentService';
import { getApiErrorMessage } from '../utils/errorUtils';
import type { Prescription, Consultation } from '../types';
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
import { Dropdown } from 'primereact/dropdown';
import { AutoComplete } from 'primereact/autocomplete';
import { Checkbox } from 'primereact/checkbox';

const Prescriptions: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  // Medication autocomplete
  const [medicamentSuggestions, setMedicamentSuggestions] = useState<Medicament[]>([]);
  const [selectedMedicament, setSelectedMedicament] = useState<any>(null);

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
        summary: 'Erreur',
        detail: 'Impossible de charger les ordonnances',
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
        summary: 'Erreur',
        detail: 'Erreur lors de la recherche',
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

  const onMedicamentSelect = (e: any) => {
    const med: Medicament = e.value;
    setSelectedMedicament(med);
    setFormData({
      ...formData,
      medicationName: med.nom,
      dosage: med.dosage1 ? `${med.dosage1} ${med.uniteDosage1 || ''}`.trim() : formData.dosage,
      pharmaceuticalForm: med.forme || formData.pharmaceuticalForm,
    });
  };

  const openNewDialog = () => {
    setEditingPrescription(null);
    setSelectedMedicament(null);
    setFormData({
      isRenewable: false,
      quantity: 1,
    });
    setDialogVisible(true);
  };

  const openEditDialog = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setSelectedMedicament(prescription.medicationName);
    setFormData({
      consultationId: prescription.consultation?.id,
      medicationName: prescription.medicationName,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      instructions: prescription.instructions,
      quantity: prescription.quantity,
      pharmaceuticalForm: prescription.pharmaceuticalForm,
      isRenewable: prescription.isRenewable,
      notes: prescription.notes,
    });
    setDialogVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.medicationName || !formData.consultationId) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir les champs obligatoires (consultation et médicament)',
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingPrescription) {
        await prescriptionService.updatePrescription(editingPrescription.id, formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Ordonnance mise à jour',
        });
      } else {
        await prescriptionService.createPrescription(formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Ordonnance créée',
        });
      }
      setDialogVisible(false);
      await loadPrescriptions();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: getApiErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (prescription: Prescription) => {
    confirmDialog({
      message: `Êtes-vous sûr de vouloir supprimer l'ordonnance de ${prescription.medicationName} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleDelete(prescription),
    });
  };

  const handleDelete = async (prescription: Prescription) => {
    try {
      await prescriptionService.deletePrescription(prescription.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Ordonnance supprimée',
      });
      loadPrescriptions();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: getApiErrorMessage(error, "Impossible de supprimer l'ordonnance"),
      });
    }
  };

  // Body templates
  const patientBodyTemplate = (rowData: Prescription) => {
    const patient = rowData.consultation?.patient;
    console.log(patient)
    return patient ? `${patient.lastName} ${patient.firstName}` : '—';
  };

  const dateBodyTemplate = (rowData: Prescription) => {
    return new Date(rowData.createdAt).toLocaleDateString('fr-FR');
  };

  const renewableBodyTemplate = (rowData: Prescription) => {
    return rowData.isRenewable ? (
      <Tag value="Renouvelable" severity="success" />
    ) : (
      <Tag value="Non renouvelable" severity="warning" />
    );
  };

  const actionBodyTemplate = (rowData: Prescription) => (
    <div className="flex gap-1">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-warning p-button-sm"
        onClick={() => openEditDialog(rowData)}
        tooltip="Modifier"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-sm"
        onClick={() => confirmDelete(rowData)}
        tooltip="Supprimer"
      />
      <Button
        icon="pi pi-print"
        className="p-button-rounded p-button-secondary p-button-sm"
        tooltip="Imprimer"
      />
    </div>
  );

  // Consultation dropdown template
  const consultationOptionTemplate = (option: Consultation) => {
    const patient = option.patient;
    const patientName = patient ? `${patient.lastName} ${patient.firstName}` : 'N/A';
    const date = new Date(option.createdAt).toLocaleDateString('fr-FR');
    return (
      <span>{option.referenceNumber } — {patientName} — {option.reason || 'Sans motif'} ({date})</span>
    );
  };

  const selectedConsultationTemplate = (value: any) => {
    if (!value) return <span>Sélectionner une consultation</span>;
    // PrimeReact valueTemplate passes the full option object, not just the optionValue
    const consultation = typeof value === 'object'
      ? value as Consultation
      : consultations.find((c: Consultation) => c.id === value);
    if (!consultation) return <span>Consultation #{value}</span>;
    const patient = consultation.patient;
    const patientName = patient ? `${patient.lastName} ${patient.firstName}` : 'N/A';
    return <span>{consultation.referenceNumber } — {patientName} — {consultation.reason || 'Sans motif'}</span>;
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Annuler"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setDialogVisible(false)}
      />
      <Button
        label={editingPrescription ? 'Modifier' : 'Créer'}
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
        <h1 className="text-3xl font-bold m-0">Ordonnances</h1>
        <Button
          label="Nouvelle ordonnance"
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
            placeholder="Rechercher une ordonnance..."
            className="w-full"
            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          />
        </span>
        <Button icon="pi pi-search" onClick={handleSearch} />
        <Button icon="pi pi-refresh" className="p-button-secondary" onClick={loadPrescriptions} />
      </div>

      {/* Table */}
      <DataTable
        value={prescriptions}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune ordonnance trouvée"
        className="shadow-2"
      >
        <Column field="id" header="ID" sortable style={{ width: '5rem' }} />
        <Column header="Patient" body={patientBodyTemplate} sortable />
        <Column field="medicationName" header="Médicament" sortable />
        <Column field="dosage" header="Dosage" />
        <Column field="frequency" header="Fréquence" />
        <Column field="duration" header="Durée" />
        <Column header="Renouvelable" body={renewableBodyTemplate} style={{ width: '10rem' }} />
        <Column field="createdAt" header="Date" body={dateBodyTemplate} sortable />
        <Column body={actionBodyTemplate} header="Actions" style={{ width: '10rem' }} />
      </DataTable>

      {/* Create/Edit Dialog */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header={editingPrescription ? "Modifier l'ordonnance" : 'Nouvelle ordonnance'}
        className="w-11/12 md:w-8 lg:w-8"
        footer={dialogFooter}
      >
        <div className="grid">
          {/* Consultation */}
          <div className="col-12 field">
            <label className="block font-medium mb-2">Consultation *</label>
            <Dropdown
              value={formData.consultationId}
              options={consultations}
              optionLabel="reason"
              optionValue="id"
              onChange={(e) => setFormData({ ...formData, consultationId: e.value })}
              placeholder="Sélectionner une consultation"
              className="w-full"
              filter
              filterPlaceholder="Rechercher..."
              itemTemplate={consultationOptionTemplate}
              valueTemplate={selectedConsultationTemplate}
              disabled={!!editingPrescription}
            />
          </div>

          {/* Medication AutoComplete */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Médicament *</label>
            <AutoComplete
              value={selectedMedicament}
              suggestions={medicamentSuggestions}
              completeMethod={searchMedicaments}
              field="nom"
              onChange={(e) => {
                setSelectedMedicament(e.value);
                if (typeof e.value === 'string') {
                  setFormData({ ...formData, medicationName: e.value });
                }
              }}
              onSelect={onMedicamentSelect}
              placeholder="Rechercher un médicament..."
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
            <label className="block font-medium mb-2">Dosage</label>
            <InputText
              value={formData.dosage || ''}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              className="w-full"
              placeholder="Ex: 400mg"
            />
          </div>

          {/* Pharmaceutical Form */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Forme pharmaceutique</label>
            <InputText
              value={formData.pharmaceuticalForm || ''}
              onChange={(e) => setFormData({ ...formData, pharmaceuticalForm: e.target.value })}
              className="w-full"
              placeholder="Ex: Comprimé, Sirop..."
            />
          </div>

          {/* Quantity */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Quantité</label>
            <InputNumber
              value={formData.quantity}
              onValueChange={(e) => setFormData({ ...formData, quantity: e.value })}
              className="w-full"
              min={1}
            />
          </div>

          {/* Frequency */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Fréquence</label>
            <InputText
              value={formData.frequency || ''}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full"
              placeholder="Ex: 3 fois par jour"
            />
          </div>

          {/* Duration */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Durée</label>
            <InputText
              value={formData.duration || ''}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full"
              placeholder="Ex: 7 jours"
            />
          </div>

          {/* Instructions */}
          <div className="col-12 field">
            <label className="block font-medium mb-2">Instructions</label>
            <InputTextarea
              value={formData.instructions || ''}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full"
              rows={3}
              autoResize
              placeholder="Instructions pour le patient..."
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
              <label htmlFor="isRenewable" className="font-medium cursor-pointer">Ordonnance renouvelable</label>
            </div>
          </div>

          {/* Notes */}
          <div className="col-12 field">
            <label className="block font-medium mb-2">Notes</label>
            <InputTextarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full"
              rows={2}
              autoResize
              placeholder="Notes additionnelles..."
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Prescriptions;
