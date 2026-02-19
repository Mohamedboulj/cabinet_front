import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { getApiErrorMessage } from '../utils/errorUtils';
import type { Patient } from '../types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients();
      setPatients(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les patients',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPatients();
      return;
    }

    setLoading(true);
    try {
      const response = await patientService.searchPatients(searchQuery);
      setPatients(response.data);
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
    setEditingPatient(null);
    setFormData({});
    setDialogVisible(true);
  };

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({ ...patient });
    setDialogVisible(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingPatient) {
        await patientService.updatePatient(editingPatient.id, formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Patient mis à jour',
        });
      } else {
        await patientService.createPatient(formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Patient créé',
        });
      }
      setDialogVisible(false);
      loadPatients();
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

  const confirmDelete = (patient: Patient) => {
    confirmDialog({
      message: `Êtes-vous sûr de vouloir supprimer ${patient.fullName} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleDelete(patient),
    });
  };

  const handleDelete = async (patient: Patient) => {
    try {
      await patientService.deletePatient(patient.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Patient supprimé',
      });
      loadPatients();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: getApiErrorMessage(error, 'Impossible de supprimer le patient'),
      });
    }
  };

  const actionBodyTemplate = (rowData: Patient) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-info p-button-sm"
        onClick={() => navigate(`/patients/${rowData.id}`)}
        tooltip="Voir"
      />
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
    </div>
  );

  const ageBodyTemplate = (rowData: Patient) => {
    return rowData.age ? `${rowData.age} ans` : '-';
  };

  const genderBodyTemplate = (rowData: Patient) => {
    if (rowData.gender === 'M') {
      return <Tag icon="pi pi-male" value="Homme" className="bg-blue-100 text-blue-700" />;
    } else if (rowData.gender === 'F') {
      return <Tag icon="pi pi-female" value="Femme" className="bg-pink-100 text-pink-700" />;
    }
    return '-';
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
        label={editingPatient ? 'Modifier' : 'Créer'}
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
        <h1 className="text-3xl font-bold m-0">Gestion des Patients</h1>
        <Button
          label="Nouveau patient"
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
            placeholder="Rechercher un patient..."
            className="w-full"
            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          />
        </span>
        <Button icon="pi pi-search" onClick={handleSearch} />
        <Button icon="pi pi-refresh" className="p-button-secondary" onClick={loadPatients} />
      </div>

      {/* Patients Table */}
      <DataTable
        value={patients}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucun patient trouvé"
        className="shadow-2"
      >
        <Column field="id" header="ID" sortable style={{ width: '5rem' }} />
        <Column field="lastName" header="Nom" sortable />
        <Column field="firstName" header="Prénom" sortable />
        <Column field="cin" header="CIN" sortable />
        <Column field="phone" header="Téléphone" />
        <Column field="age" header="Âge" body={ageBodyTemplate} sortable />
        <Column field="gender" header="Sexe" body={genderBodyTemplate} sortable />
        <Column body={actionBodyTemplate} header="Actions" style={{ width: '10rem' }} />
      </DataTable>

      {/* Patient Dialog */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header={editingPatient ? 'Modifier le patient' : 'Nouveau patient'}
        className="w-11/12 md:w-6 lg:w-8"
        footer={dialogFooter}
      >
        <div className="grid">
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Nom *</label>
            <InputText
              value={formData.lastName || ''}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Prénom *</label>
            <InputText
              value={formData.firstName || ''}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">CIN</label>
            <InputText
              value={formData.cin || ''}
              onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Téléphone *</label>
            <InputText
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Email</label>
            <InputText
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Date de naissance</label>
            <Calendar
              value={formData.birthDate ? new Date(formData.birthDate) : null}
              onChange={(e) => setFormData({ ...formData, birthDate: e.value?.toISOString() })}
              dateFormat="dd/mm/yy"
              className="w-full"
              showIcon
            />
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Sexe</label>
            <Dropdown
              value={formData.gender || ''}
              options={[
                { label: 'Homme', value: 'M' },
                { label: 'Femme', value: 'F' },
              ]}
              onChange={(e) => setFormData({ ...formData, gender: e.value })}
              placeholder="Sélectionner"
              className="w-full"
            />
          </div>
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Groupe sanguin</label>
            <Dropdown
              value={formData.bloodType || ''}
              options={[
                { label: 'A+', value: 'A+' },
                { label: 'A-', value: 'A-' },
                { label: 'B+', value: 'B+' },
                { label: 'B-', value: 'B-' },
                { label: 'AB+', value: 'AB+' },
                { label: 'AB-', value: 'AB-' },
                { label: 'O+', value: 'O+' },
                { label: 'O-', value: 'O-' },
              ]}
              onChange={(e) => setFormData({ ...formData, bloodType: e.value })}
              placeholder="Sélectionner"
              className="w-full"
            />
          </div>
          <div className="col-12 field">
            <label className="block font-medium mb-2">Adresse</label>
            <InputText
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-12 field">
            <label className="block font-medium mb-2">Antécédents médicaux</label>
            <textarea
              value={formData.medicalHistory || ''}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              className="w-full p-inputtextarea p-inputtext"
              rows={3}
            />
          </div>
          <div className="col-12 field">
            <label className="block font-medium mb-2">Allergies</label>
            <textarea
              value={formData.allergies || ''}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full p-inputtextarea p-inputtext"
              rows={2}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Patients;
