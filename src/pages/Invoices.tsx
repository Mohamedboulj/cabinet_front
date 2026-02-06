import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Invoice } from '../types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setInvoices([
      {
        id: 1,
        invoiceNumber: 'INV-2024-001',
        patient: { id: 1, firstName: 'Jean', lastName: 'Dupont', fullName: 'Jean Dupont', phone: '0612345678', createdAt: '', updatedAt: '' },
        invoiceDate: '2024-01-15',
        totalAmount: '150.00',
        paidAmount: '150.00',
        status: 'PAID',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        items: [],
      },
      {
        id: 2,
        invoiceNumber: 'INV-2024-002',
        patient: { id: 2, firstName: 'Marie', lastName: 'Durand', fullName: 'Marie Durand', phone: '0698765432', createdAt: '', updatedAt: '' },
        invoiceDate: '2024-01-16',
        totalAmount: '200.00',
        paidAmount: '0.00',
        status: 'PENDING',
        createdAt: '2024-01-16T14:00:00Z',
        updatedAt: '2024-01-16T14:00:00Z',
        items: [],
      },
    ]);
    setLoading(false);
  }, []);

  const statusBodyTemplate = (rowData: Invoice) => {
    const statusMap: Record<string, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' }> = {
      'PAID': { label: 'Payée', severity: 'success' },
      'PENDING': { label: 'En attente', severity: 'warning' },
      'PARTIAL': { label: 'Partielle', severity: 'info' },
      'OVERDUE': { label: 'En retard', severity: 'danger' },
      'CANCELLED': { label: 'Annulée', severity: 'danger' },
    };
    const status = statusMap[rowData.status] || { label: rowData.status, severity: 'info' };
    return <Tag value={status.label} severity={status.severity} />;
  };

  const amountBodyTemplate = (rowData: Invoice) => {
    return `${parseFloat(rowData.totalAmount).toLocaleString()} €`;
  };

  const balanceBodyTemplate = (rowData: Invoice) => {
    const balance = parseFloat(rowData.totalAmount) - parseFloat(rowData.paidAmount);
    return balance > 0 ? (
      <span className="text-red-500 font-semibold">{balance.toLocaleString()} €</span>
    ) : (
      <span className="text-green-500">0 €</span>
    );
  };

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold m-0">Factures</h1>
        <Button
          label="Nouvelle facture"
          icon="pi pi-plus"
          className="p-button-success"
        />
      </div>

      <DataTable
        value={invoices}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        stripedRows
        showGridlines
        emptyMessage="Aucune facture trouvée"
        className="shadow-2"
      >
        <Column field="invoiceNumber" header="N° Facture" sortable />
        <Column field="patient.fullName" header="Patient" sortable />
        <Column field="invoiceDate" header="Date" sortable />
        <Column field="totalAmount" header="Montant" body={amountBodyTemplate} sortable />
        <Column field="balance" header="Solde" body={balanceBodyTemplate} sortable />
        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
        <Column 
          body={(rowData) => (
            <div className="flex gap-1">
              <Button
                icon="pi pi-eye"
                className="p-button-rounded p-button-info p-button-sm"
                onClick={() => navigate(`/invoices/${rowData.id}`)}
              />
              <Button
                icon="pi pi-print"
                className="p-button-rounded p-button-secondary p-button-sm"
              />
            </div>
          )}
          header="Actions"
          style={{ width: '8rem' }}
        />
      </DataTable>
    </div>
  );
};

export default Invoices;
