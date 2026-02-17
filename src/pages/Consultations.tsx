import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { consultationService } from '../services/consultationService';
import { patientService } from '../services/patientService';
import type { Consultation, Patient } from '../types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import patients from "./Patients.tsx";

const Consultations: React.FC = () => {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadConsultations();
    loadPatients();
  }, []);

  const loadConsultations = async () => {
    setLoading(true);
    try {
      const response = await consultationService.getConsultations();
      console.log(response)
      setConsultations(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les consultations',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients();
      setPatients(response.data);
    } catch (error) {
      // Silent fail – patients are only needed for the dropdown
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadConsultations();
      return;
    }

    setLoading(true);
    try {
      const response = await consultationService.getConsultations({ search: searchQuery });
      setConsultations(response.data);
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

  const openNewDialog = () => {
    setEditingConsultation(null);
    setFormData({ status: 'IN_PROGRESS' });
    setDialogVisible(true);
  };

  const openEditDialog = (consultation: Consultation) => {
    setEditingConsultation(consultation);
    setFormData({
      patientId: consultation.patient?.id,
      reason: consultation.reason,
      anamnesis: consultation.anamnesis,
      examination: consultation.examination,
      diagnosis: consultation.diagnosis,
      notes: consultation.notes,
      recommendations: consultation.recommendations,
      bloodPressure: consultation.bloodPressure,
      weight: consultation.weight,
      temperature: consultation.temperature,
      heartRate: consultation.heartRate,
      respiratoryRate: consultation.respiratoryRate,
      oxygenSaturation: consultation.oxygenSaturation,
      status: consultation.status,
    });
    setDialogVisible(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingConsultation) {
        await consultationService.updateConsultation(editingConsultation.id, formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Consultation mise à jour',
        });
      } else {
        console.log(formData)
        await consultationService.createConsultation(formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Consultation créée',
        });
      }
      setDialogVisible(false);
      loadConsultations();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: error.response?.data?.message || 'Une erreur est survenue',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (consultation: Consultation) => {
    confirmDialog({
      message: `Êtes-vous sûr de vouloir supprimer la consultation #${consultation.id} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleDelete(consultation),
    });
  };

  const handleDelete = async (consultation: Consultation) => {
    try {
      await consultationService.deleteConsultation(consultation.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Consultation supprimée',
      });
      loadConsultations();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: error.response?.data?.error || 'Impossible de supprimer la consultation',
      });
    }
  };

  const handleComplete = async (consultation: Consultation) => {
    try {
      await consultationService.completeConsultation(consultation.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Consultation terminée',
      });
      loadConsultations();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de terminer la consultation',
      });
    }
  };

  const handleCancel = async (consultation: Consultation) => {
    confirmDialog({
      message: 'Êtes-vous sûr de vouloir annuler cette consultation ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await consultationService.cancelConsultation(consultation.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Succès',
            detail: 'Consultation annulée',
          });
          loadConsultations();
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Erreur',
            detail: "Impossible d'annuler la consultation",
          });
        }
      },
    });
  };

  const statusBodyTemplate = (rowData: Consultation) => {
    const statusMap: Record<string, { label: string; severity: 'success' | 'warning' | 'danger' }> = {
      'IN_PROGRESS': { label: 'En cours', severity: 'warning' },
      'COMPLETED': { label: 'Terminée', severity: 'success' },
      'CANCELLED': { label: 'Annulée', severity: 'danger' },
    };
    const status = statusMap[rowData.status] || { label: rowData.status, severity: 'warning' };
    return <Tag value={status.label} severity={status.severity} />;
  };

  const paymentBodyTemplate = (rowData: Consultation) => {
    return rowData.isPaid ? (
      <Tag icon="pi pi-check" value="Payée" severity="success" />
    ) : (
      <Tag icon="pi pi-times" value="Non payée" severity="danger" />
    );
  };

  const dateBodyTemplate = (rowData: Consultation) => {
    return new Date(rowData.createdAt).toLocaleString('fr-FR');
  };

  const actionBodyTemplate = (rowData: Consultation) => {
    const canComplete = rowData.status === 'IN_PROGRESS';
    const canCancel = rowData.status === 'IN_PROGRESS';

    return (
      <div className="flex gap-1">
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => navigate(`/consultations/${rowData.id}`)}
          tooltip="Voir"
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-warning p-button-sm"
          onClick={() => openEditDialog(rowData)}
          tooltip="Modifier"
        />
        {canComplete && (
          <Button
            icon="pi pi-check-circle"
            className="p-button-rounded p-button-success p-button-sm"
            onClick={() => handleComplete(rowData)}
            tooltip="Terminer"
          />
        )}
        {canCancel && (
          <Button
            icon="pi pi-times-circle"
            className="p-button-rounded p-button-secondary p-button-sm"
            onClick={() => handleCancel(rowData)}
            tooltip="Annuler"
          />
        )}
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDelete(rowData)}
          tooltip="Supprimer"
        />
      </div>
    );
  };
  const patientFullName = (rowData:any) =>
      `${rowData.patient.lastName} ${rowData.patient.firstName}`;

  const doctorFullName = (rowData:any) =>
      `${rowData.doctor.lastName} ${rowData.doctor.firstName}`;

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Annuler"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setDialogVisible(false)}
      />
      <Button
        label={editingConsultation ? 'Modifier' : 'Créer'}
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
        <h1 className="text-3xl font-bold m-0">Consultations</h1>
        <Button
          label="Nouvelle consultation"
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
            placeholder="Rechercher une consultation..."
            className="w-full"
            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          />
        </span>
        <Button icon="pi pi-search" onClick={handleSearch} />
        <Button icon="pi pi-refresh" className="p-button-secondary" onClick={loadConsultations} />
      </div>

      {/* Consultations Table */}
      <DataTable
        value={consultations}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        stripedRows
        showGridlines
        emptyMessage="Aucune consultation trouvée"
        className="shadow-2"
      >
        <Column field="id" header="ID" sortable style={{ width: '5rem' }} />
        <Column field="patient.lastName" header="Patient" body={patientFullName}  sortable />
        <Column field="doctor.lastName" header="Médecin" body={doctorFullName}  sortable />
        <Column field="createdAt" header="Date" body={dateBodyTemplate} sortable />
        <Column field="reason" header="Motif" />
        <Column field="diagnosis" header="Diagnostic" />
        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
        <Column field="isPaid" header="Paiement" body={paymentBodyTemplate} sortable />
        <Column body={actionBodyTemplate} header="Actions" style={{ width: '14rem' }} />
      </DataTable>

      {/* Consultation Dialog */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header={editingConsultation ? 'Modifier la consultation' : 'Nouvelle consultation'}
        className="w-11/12 md:w-8 lg:w-8"
        footer={dialogFooter}
      >
        <div className="grid">
          {/* Patient Selection */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Patient *</label>
            <Dropdown
              value={formData.patient}
              options={patients.map((p) => ({ label: `${p.firstName} ${p.lastName}`, value: p.id }))}
              onChange={(e) => setFormData({ ...formData, patient: e.value })}
              placeholder="Sélectionner un patient"
              className="w-full"
              filter
              filterPlaceholder="Rechercher..."
              disabled={!!editingConsultation}
            />
          </div>

          {/* Status */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Statut</label>
            <Dropdown
              value={formData.status}
              options={[
                { label: 'En cours', value: 'IN_PROGRESS' },
                { label: 'Terminée', value: 'COMPLETED' },
                { label: 'Annulée', value: 'CANCELLED' },
              ]}
              onChange={(e) => setFormData({ ...formData, status: e.value })}
              placeholder="Sélectionner"
              className="w-full"
            />
          </div>

          {/* Reason */}
          <div className="col-12 field">
            <label className="block font-medium mb-2">Motif de consultation *</label>
            <InputText
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Anamnesis */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Anamnèse</label>
            <InputTextarea
              value={formData.anamnesis || ''}
              onChange={(e) => setFormData({ ...formData, anamnesis: e.target.value })}
              className="w-full"
              rows={3}
              autoResize
            />
          </div>

          {/* Examination */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Examen clinique</label>
            <InputTextarea
              value={formData.examination || ''}
              onChange={(e) => setFormData({ ...formData, examination: e.target.value })}
              className="w-full"
              rows={3}
              autoResize
            />
          </div>

          {/* Diagnosis */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Diagnostic</label>
            <InputTextarea
              value={formData.diagnosis || ''}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full"
              rows={3}
              autoResize
            />
          </div>

          {/* Recommendations */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Recommandations</label>
            <InputTextarea
              value={formData.recommendations || ''}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              className="w-full"
              rows={3}
              autoResize
            />
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
            />
          </div>

          {/* Vital Signs Section */}
          <div className="col-12">
            <h3 className="text-lg font-semibold mt-2 mb-3">Signes vitaux</h3>
          </div>

          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">Tension artérielle</label>
            <InputText
              value={formData.bloodPressure || ''}
              onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
              className="w-full"
              placeholder="ex: 120/80"
            />
          </div>

          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">Poids (kg)</label>
            <InputText
              value={formData.weight || ''}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full"
              placeholder="ex: 75.5"
            />
          </div>

          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">Température (°C)</label>
            <InputText
              value={formData.temperature || ''}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              className="w-full"
              placeholder="ex: 37.0"
            />
          </div>

          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">Fréquence cardiaque (bpm)</label>
            <InputNumber
              value={formData.heartRate || null}
              onValueChange={(e) => setFormData({ ...formData, heartRate: e.value })}
              className="w-full"
              placeholder="ex: 72"
            />
          </div>

          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">Fréquence respiratoire</label>
            <InputNumber
              value={formData.respiratoryRate || null}
              onValueChange={(e) => setFormData({ ...formData, respiratoryRate: e.value })}
              className="w-full"
              placeholder="ex: 16"
            />
          </div>

          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">Saturation O₂ (%)</label>
            <InputText
              value={formData.oxygenSaturation || ''}
              onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
              className="w-full"
              placeholder="ex: 98"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Consultations;
