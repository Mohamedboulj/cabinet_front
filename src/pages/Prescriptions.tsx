import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Prescription } from '../types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';

const Prescriptions: React.FC = () => {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Mock data
    setPrescriptions([
      {
        id: 1,
        consultation: { id: 1, patient: { id: 1, firstName: 'Jean', lastName: 'Dupont', fullName: 'Jean Dupont', phone: '', createdAt: '', updatedAt: '' }, doctor: { id: 1, email: '', firstName: '', lastName: '', roles: [], isActive: true, createdAt: '', updatedAt: '' }, reason: '', status: 'COMPLETED', isPaid: true, createdAt: '', updatedAt: '' },
        medicationName: 'Amlodipine',
        dosage: '5mg',
        frequency: '1 fois par jour',
        duration: '30 jours',
        instructions: 'Prendre le matin',
        isRenewable: false,
        renewalsCount: 0,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 2,
        consultation: { id: 2, patient: { id: 2, firstName: 'Marie', lastName: 'Durand', fullName: 'Marie Durand', phone: '', createdAt: '', updatedAt: '' }, doctor: { id: 1, email: '', firstName: '', lastName: '', roles: [], isActive: true, createdAt: '', updatedAt: '' }, reason: '', status: 'COMPLETED', isPaid: true, createdAt: '', updatedAt: '' },
        medicationName: 'Paracétamol',
        dosage: '500mg',
        frequency: '3 fois par jour',
        duration: '7 jours',
        instructions: 'En cas de douleur',
        isRenewable: true,
        renewalsCount: 2,
        createdAt: '2024-01-16T14:00:00Z',
        updatedAt: '2024-01-16T14:00:00Z',
      },
    ]);
    setLoading(false);
  }, []);

  const filteredPrescriptions = prescriptions.filter(p =>
    p.medicationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.consultation.patient.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dateBodyTemplate = (rowData: Prescription) => {
    return new Date(rowData.createdAt).toLocaleDateString('fr-FR');
  };

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold m-0">Ordonnances</h1>
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
          />
        </span>
      </div>

      <DataTable
        value={filteredPrescriptions}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        stripedRows
        showGridlines
        emptyMessage="Aucune ordonnance trouvée"
        className="shadow-2"
      >
        <Column field="id" header="ID" sortable style={{ width: '5rem' }} />
        <Column field="consultation.patient.fullName" header="Patient" sortable />
        <Column field="medicationName" header="Médicament" sortable />
        <Column field="dosage" header="Dosage" />
        <Column field="frequency" header="Fréquence" />
        <Column field="duration" header="Durée" />
        <Column field="createdAt" header="Date" body={dateBodyTemplate} sortable />
        <Column 
          body={(rowData) => (
            <Button
              icon="pi pi-print"
              className="p-button-rounded p-button-secondary p-button-sm"
              onClick={() => {}}
              tooltip="Imprimer"
            />
          )}
          header="Actions"
          style={{ width: '6rem' }}
        />
      </DataTable>
    </div>
  );
};

export default Prescriptions;
