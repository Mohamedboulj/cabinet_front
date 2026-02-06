import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Consultation } from '../types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';

const Consultations: React.FC = () => {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    setConsultations([
      {
        id: 1,
        patient: { id: 1, firstName: 'Jean', lastName: 'Dupont', fullName: 'Jean Dupont', phone: '0612345678', createdAt: '', updatedAt: '' },
        doctor: { id: 1, email: 'doc@example.com', firstName: 'Dr.', lastName: 'Martin', fullName: 'Dr. Martin', roles: ['ROLE_MEDECIN'], isActive: true, createdAt: '', updatedAt: '' },
        reason: 'Consultation de routine',
        diagnosis: 'Hypertension légère',
        status: 'COMPLETED',
        isPaid: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
      {
        id: 2,
        patient: { id: 2, firstName: 'Marie', lastName: 'Durand', fullName: 'Marie Durand', phone: '0698765432', createdAt: '', updatedAt: '' },
        doctor: { id: 1, email: 'doc@example.com', firstName: 'Dr.', lastName: 'Martin', fullName: 'Dr. Martin', roles: ['ROLE_MEDECIN'], isActive: true, createdAt: '', updatedAt: '' },
        reason: 'Douleurs abdominales',
        diagnosis: 'Gastrite',
        status: 'COMPLETED',
        isPaid: false,
        createdAt: '2024-01-16T14:00:00Z',
        updatedAt: '2024-01-16T14:30:00Z',
      },
    ]);
    setLoading(false);
  }, []);

  const statusBodyTemplate = (rowData: Consultation) => {
    return (
      <Tag 
        value={rowData.status === 'COMPLETED' ? 'Terminée' : 'En cours'}
        severity={rowData.status === 'COMPLETED' ? 'success' : 'warning'}
      />
    );
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

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold m-0">Consultations</h1>
        <Button
          label="Nouvelle consultation"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={() => navigate('/consultations/new')}
        />
      </div>

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
        <Column field="patient.fullName" header="Patient" sortable />
        <Column field="doctor.fullName" header="Médecin" sortable />
        <Column field="createdAt" header="Date" body={dateBodyTemplate} sortable />
        <Column field="reason" header="Motif" />
        <Column field="diagnosis" header="Diagnostic" />
        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
        <Column field="isPaid" header="Paiement" body={paymentBodyTemplate} sortable />
        <Column 
          body={(rowData) => (
            <Button
              icon="pi pi-eye"
              className="p-button-rounded p-button-info p-button-sm"
              onClick={() => navigate(`/consultations/${rowData.id}`)}
            />
          )}
          header="Actions"
          style={{ width: '6rem' }}
        />
      </DataTable>
    </div>
  );
};

export default Consultations;
