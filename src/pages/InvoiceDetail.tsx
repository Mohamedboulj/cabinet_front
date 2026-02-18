import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../services/invoiceService';
import { getApiErrorMessage } from '../utils/errorUtils';
import type { Invoice } from '../types';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [paymentData, setPaymentData] = useState<any>({});
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    if (id) {
      loadInvoice(parseInt(id));
    }
  }, [id]);

  const loadInvoice = async (invoiceId: number) => {
    setLoading(true);
    try {
      const response = await invoiceService.getInvoice(invoiceId);
      setInvoice(response.data);
      console.log(response)
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger la facture',
      });
    } finally {
      setLoading(false);
    }
  };

  const openPaymentDialog = () => {
    if (!invoice) return;
    const balance = parseFloat(invoice.totalAmount) - parseFloat(invoice.paidAmount);
    setPaymentData({
      amount: balance.toFixed(2),
      paymentMethod: 'CASH',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setPaymentDialogVisible(true);
  };

  const handleAddPayment = async () => {
    if (!invoice) return;
    setSubmittingPayment(true);
    try {
      await invoiceService.addPayment(invoice.id, paymentData);
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Paiement enregistré',
      });
      setPaymentDialogVisible(false);
      loadInvoice(invoice.id);
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: getApiErrorMessage(error, 'Impossible d\'enregistrer le paiement'),
      });
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCancel = () => {
    if (!invoice) return;
    confirmDialog({
      message: `Êtes-vous sûr de vouloir annuler la facture ${invoice.invoiceNumber} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await invoiceService.cancelInvoice(invoice.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Succès',
            detail: 'Facture annulée',
          });
          loadInvoice(invoice.id);
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Erreur',
            detail: "Impossible d'annuler la facture",
          });
        }
      },
    });
  };

  const handleDelete = () => {
    if (!invoice) return;
    confirmDialog({
      message: `Êtes-vous sûr de vouloir supprimer la facture ${invoice.invoiceNumber} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await invoiceService.deleteInvoice(invoice.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Succès',
            detail: 'Facture supprimée',
          });
          navigate('/invoices');
        } catch (error: any) {
          toast.current?.show({
            severity: 'error',
            summary: 'Erreur',
            detail: getApiErrorMessage(error, 'Impossible de supprimer la facture'),
          });
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' }> = {
      'PAID': { label: 'Payée', severity: 'success' },
      'PENDING': { label: 'En attente', severity: 'warning' },
      'PARTIAL': { label: 'Partielle', severity: 'info' },
      'OVERDUE': { label: 'En retard', severity: 'danger' },
      'CANCELLED': { label: 'Annulée', severity: 'danger' },
      'DRAFT': { label: 'Brouillon', severity: 'info' },
    };
    const s = statusMap[status] || { label: status, severity: 'info' };
    return <Tag value={s.label} severity={s.severity} className="text-lg" />;
  };

  const paymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'CASH': 'Espèces',
      'CARD': 'Carte',
      'CHECK': 'Chèque',
      'TRANSFER': 'Virement',
      'INSURANCE': 'Assurance',
      'MOBILE': 'Mobile',
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
        <i className="pi pi-exclamation-circle text-4xl text-orange-500 mb-3"></i>
        <h2>Facture introuvable</h2>
        <Button label="Retour aux factures" icon="pi pi-arrow-left" onClick={() => navigate('/invoices')} />
      </div>
    );
  }

  const balance = parseFloat(invoice.totalAmount) - parseFloat(invoice.paidAmount);
  const canPay = balance > 0 && invoice.status !== 'CANCELLED';
  const canCancel = ['PENDING', 'DRAFT', 'PARTIAL'].includes(invoice.status);

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

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
          <div className="mt-2">{getStatusTag(invoice.status)}</div>
        </div>
        <div className="flex gap-2">
          {canPay && (
            <Button
              label="Ajouter paiement"
              icon="pi pi-money-bill"
              className="p-button-success"
              onClick={openPaymentDialog}
            />
          )}
          {canCancel && (
            <Button
              label="Annuler"
              icon="pi pi-times-circle"
              className="p-button-secondary"
              onClick={handleCancel}
            />
          )}
          <Button
            label="Supprimer"
            icon="pi pi-trash"
            className="p-button-danger"
            onClick={handleDelete}
          />
          <Button
            label="Imprimer"
            icon="pi pi-print"
            className="p-button-secondary"
            onClick={() => window.print()}
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
                <p className="m-0"><strong>{invoice.patient?.fullName || `${invoice.patient?.firstName} ${invoice.patient?.lastName}`}</strong></p>
                <p className="m-0 text-500">{(invoice.patient as any)?.address || ''}</p>
                <p className="m-0 text-500">{invoice.patient?.phone}</p>
              </div>
              <div className="text-right">
                <p className="m-0"><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
                {invoice.dueDate && (
                  <p className="m-0"><strong>Échéance:</strong> {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
            </div>

            <DataTable value={invoice.items || []} className="mb-4" emptyMessage="Aucun article">
              <Column field="description" header="Description" />
              <Column field="quantity" header="Qté" style={{ width: '5rem' }} />
              <Column
                field="unitPrice"
                header="Prix unitaire"
                style={{ width: '8rem' }}
                body={(rowData) => `${parseFloat(rowData.unitPrice).toFixed(2)} MAD`}
              />
              <Column
                field="totalPrice"
                header="Total"
                style={{ width: '8rem' }}
                body={(rowData) => `${parseFloat(rowData.totalPrice).toFixed(2)} MAD`}
              />
            </DataTable>

            <div className="flex justify-content-end">
              <div className="w-15rem">
                <div className="flex justify-content-between mb-2">
                  <span>Sous-total:</span>
                  <span>{parseFloat(invoice.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
                </div>
                {parseFloat(invoice.discountAmount) > 0 && (
                  <div className="flex justify-content-between mb-2 text-orange-500">
                    <span>Remise:</span>
                    <span>-{parseFloat(invoice.discountAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
                  </div>
                )}
                <div className="flex justify-content-between mb-2">
                  <span>TVA:</span>
                  <span>{parseFloat(invoice.taxAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
                </div>
                <div className="flex justify-content-between mb-2 text-lg font-bold">
                  <span>Total:</span>
                  <span>{parseFloat(invoice.totalAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
                </div>
                <div className="flex justify-content-between mb-2 text-green-500">
                  <span>Payé:</span>
                  <span>{parseFloat(invoice.paidAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
                </div>
                <div className={`flex justify-content-between text-lg font-bold ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  <span>Solde:</span>
                  <span>{balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Payments */}
        <div className="col-12 lg:col-4">
          <Card className="shadow-2" title="Paiements">
            {(!invoice.payments || invoice.payments.length === 0) ? (
              <p className="text-500 text-center">Aucun paiement</p>
            ) : (
              <div className="flex flex-column gap-3">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="p-3 surface-100 border-round">
                    <div className="flex justify-content-between align-items-center">
                      <span className="font-semibold">{parseFloat(payment.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
                      <Tag value={paymentMethodLabel(payment.paymentMethod)} />
                    </div>
                    <div className="text-sm text-500 mt-1">
                      {new Date(payment.paymentDate).toLocaleString('fr-FR')}
                    </div>
                    {payment.receivedBy && (
                      <div className="text-sm text-500">
                        Reçu par: {payment.receivedBy.fullName || `${payment.receivedBy.firstName} ${payment.receivedBy.lastName}`}
                      </div>
                    )}
                    {payment.notes && (
                      <div className="text-sm text-500 mt-1 font-italic">{payment.notes}</div>
                    )}
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
        className="w-11/12 md:w-5"
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
              loading={submittingPayment}
              onClick={handleAddPayment}
            />
          </div>
        }
      >
        <div className="flex flex-column gap-3">
          <div className="field">
            <label className="block font-medium mb-2">Montant *</label>
            <InputText
              value={paymentData.amount || ''}
              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              className="w-full"
              placeholder="0.00"
            />
            <small className="text-500">Solde restant: {balance.toFixed(2)} MAD</small>
          </div>
          <div className="field">
            <label className="block font-medium mb-2">Mode de paiement *</label>
            <Dropdown
              value={paymentData.paymentMethod}
              options={[
                { label: 'Espèces', value: 'CASH' },
                { label: 'Carte', value: 'CARD' },
                { label: 'Chèque', value: 'CHECK' },
                { label: 'Virement', value: 'TRANSFER' },
                { label: 'Assurance', value: 'INSURANCE' },
                { label: 'Mobile', value: 'MOBILE' },
              ]}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.value })}
              placeholder="Sélectionner"
              className="w-full"
            />
          </div>
          <div className="field">
            <label className="block font-medium mb-2">Date de paiement</label>
            <Calendar
              value={paymentData.paymentDate ? new Date(paymentData.paymentDate) : null}
              onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.value?.toISOString().split('T')[0] })}
              dateFormat="dd/mm/yy"
              className="w-full"
              showIcon
            />
          </div>
          {paymentData.paymentMethod === 'CHECK' && (
            <>
              <div className="field">
                <label className="block font-medium mb-2">Numéro de chèque</label>
                <InputText
                  value={paymentData.checkNumber || ''}
                  onChange={(e) => setPaymentData({ ...paymentData, checkNumber: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="field">
                <label className="block font-medium mb-2">Banque</label>
                <InputText
                  value={paymentData.bankName || ''}
                  onChange={(e) => setPaymentData({ ...paymentData, bankName: e.target.value })}
                  className="w-full"
                />
              </div>
            </>
          )}
          {paymentData.paymentMethod === 'TRANSFER' && (
            <div className="field">
              <label className="block font-medium mb-2">Référence de transaction</label>
              <InputText
                value={paymentData.transactionReference || ''}
                onChange={(e) => setPaymentData({ ...paymentData, transactionReference: e.target.value })}
                className="w-full"
              />
            </div>
          )}
          <div className="field">
            <label className="block font-medium mb-2">Notes</label>
            <InputTextarea
              value={paymentData.notes || ''}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              className="w-full"
              rows={2}
              autoResize
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default InvoiceDetail;
