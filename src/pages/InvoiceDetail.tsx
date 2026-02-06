import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useState } from 'react';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);

  // Mock invoice data
  const invoice = {
    id: parseInt(id || '1'),
    invoiceNumber: 'INV-2024-001',
    patient: { id: 1, firstName: 'Jean', lastName: 'Dupont', fullName: 'Jean Dupont', phone: '0612345678', address: '123 Rue de Paris', createdAt: '', updatedAt: '' },
    invoiceDate: '2024-01-15',
    dueDate: '2024-02-15',
    subtotal: '135.00',
    taxAmount: '15.00',
    totalAmount: '150.00',
    paidAmount: '100.00',
    status: 'PARTIAL',
    notes: 'Paiement en deux fois',
    items: [
      { id: 1, description: 'Consultation générale', quantity: 1, unitPrice: '100.00', totalPrice: '100.00' },
      { id: 2, description: 'Analyse sanguine', quantity: 1, unitPrice: '35.00', totalPrice: '35.00' },
    ],
    payments: [
      { id: 1, amount: '100.00', paymentMethod: 'CASH', paymentDate: '2024-01-15', receivedBy: { fullName: 'Secrétaire' } },
    ],
  };

  const balance = parseFloat(invoice.totalAmount) - parseFloat(invoice.paidAmount);

  const statusBodyTemplate = () => {
    const statusMap: Record<string, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' }> = {
      'PAID': { label: 'Payée', severity: 'success' },
      'PENDING': { label: 'En attente', severity: 'warning' },
      'PARTIAL': { label: 'Partielle', severity: 'info' },
      'OVERDUE': { label: 'En retard', severity: 'danger' },
    };
    const status = statusMap[invoice.status] || { label: invoice.status, severity: 'info' };
    return <Tag value={status.label} severity={status.severity} className="text-lg" />;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-content-between align-items-start mb-4">
        <div>
          <Button
            label="Retour"
            icon="pi pi-arrow-left"
            className="p-button-text mb-2"
            onClick={() => navigate('/invoices')}
          />
          <h1 className="text-3xl font-bold m-0">{invoice.invoiceNumber}</h1>
          <div className="mt-2">{statusBodyTemplate()}</div>
        </div>
        <div className="flex gap-2">
          {balance > 0 && (
            <Button
              label="Ajouter paiement"
              icon="pi pi-money-bill"
              className="p-button-success"
              onClick={() => setPaymentDialogVisible(true)}
            />
          )}
          <Button
            label="Imprimer"
            icon="pi pi-print"
            className="p-button-secondary"
          />
        </div>
      </div>

      <div className="grid">
        {/* Invoice Info */}
        <div className="col-12 lg:col-8">
          <Card className="shadow-2 mb-4">
            <div className="flex justify-content-between mb-4">
              <div>
                <h3 className="text-lg font-semibold m-0 mb-2">Facturé à</h3>
                <p className="m-0"><strong>{invoice.patient.fullName}</strong></p>
                <p className="m-0 text-500">{invoice.patient.address}</p>
                <p className="m-0 text-500">{invoice.patient.phone}</p>
              </div>
              <div className="text-right">
                <p className="m-0"><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
                <p className="m-0"><strong>Échéance:</strong> {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <DataTable value={invoice.items} className="mb-4">
              <Column field="description" header="Description" />
              <Column field="quantity" header="Qté" style={{ width: '5rem' }} />
              <Column field="unitPrice" header="Prix unitaire" style={{ width: '8rem' }} />
              <Column field="totalPrice" header="Total" style={{ width: '8rem' }} />
            </DataTable>

            <div className="flex justify-content-end">
              <div className="w-12rem">
                <div className="flex justify-content-between mb-2">
                  <span>Sous-total:</span>
                  <span>{parseFloat(invoice.subtotal).toLocaleString()} €</span>
                </div>
                <div className="flex justify-content-between mb-2">
                  <span>TVA:</span>
                  <span>{parseFloat(invoice.taxAmount).toLocaleString()} €</span>
                </div>
                <div className="flex justify-content-between mb-2 text-lg font-bold">
                  <span>Total:</span>
                  <span>{parseFloat(invoice.totalAmount).toLocaleString()} €</span>
                </div>
                <div className="flex justify-content-between mb-2 text-green-500">
                  <span>Payé:</span>
                  <span>{parseFloat(invoice.paidAmount).toLocaleString()} €</span>
                </div>
                <div className="flex justify-content-between text-lg font-bold text-red-500">
                  <span>Solde:</span>
                  <span>{balance.toLocaleString()} €</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Payments */}
        <div className="col-12 lg:col-4">
          <Card className="shadow-2" title="Paiements">
            {invoice.payments.length === 0 ? (
              <p className="text-500 text-center">Aucun paiement</p>
            ) : (
              <div className="flex flex-column gap-3">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="p-3 surface-100 border-round">
                    <div className="flex justify-content-between align-items-center">
                      <span className="font-semibold">{parseFloat(payment.amount).toLocaleString()} €</span>
                      <Tag value={payment.paymentMethod} />
                    </div>
                    <div className="text-sm text-500 mt-1">
                      {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-sm text-500">
                      Reçu par: {payment.receivedBy.fullName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog
        visible={paymentDialogVisible}
        onHide={() => setPaymentDialogVisible(false)}
        header="Ajouter un paiement"
        className="w-full max-w-md"
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Annuler"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setPaymentDialogVisible(false)}
            />
            <Button
              label="Enregistrer"
              icon="pi pi-check"
              onClick={() => setPaymentDialogVisible(false)}
            />
          </div>
        }
      >
        <div className="flex flex-column gap-3">
          <div className="field">
            <label className="block font-medium mb-2">Montant</label>
            <InputText className="w-full" placeholder="0.00" />
          </div>
          <div className="field">
            <label className="block font-medium mb-2">Mode de paiement</label>
            <Dropdown
              className="w-full"
              options={[
                { label: 'Espèces', value: 'CASH' },
                { label: 'Carte', value: 'CARD' },
                { label: 'Chèque', value: 'CHECK' },
                { label: 'Virement', value: 'TRANSFER' },
              ]}
              placeholder="Sélectionner"
            />
          </div>
          <div className="field">
            <label className="block font-medium mb-2">Notes</label>
            <InputText className="w-full" />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default InvoiceDetail;
