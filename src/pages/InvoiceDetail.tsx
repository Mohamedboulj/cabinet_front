import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../services/invoiceService';
import { getApiErrorMessage } from '../utils/errorUtils';
import { getCurrency } from '../utils/currencyUtils';
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
import InvoiceDetailSkeleton from '../components/skeletons/InvoiceDetailSkeleton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { useTranslation } from 'react-i18next';

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        summary: t('common.error'),
        detail: t('invoiceDetail.loadError'),
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
        summary: t('common.success'),
        detail: t('invoiceDetail.paymentRecorded'),
      });
      setPaymentDialogVisible(false);
      loadInvoice(invoice.id);
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: getApiErrorMessage(error, t('invoiceDetail.paymentError')),
      });
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCancel = () => {
    if (!invoice) return;
    confirmDialog({
      message: t('invoiceDetail.cancelConfirm', { number: invoice.invoiceNumber }),
      header: t('common.confirmation'),
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await invoiceService.cancelInvoice(invoice.id);
          toast.current?.show({
            severity: 'success',
            summary: t('common.success'),
            detail: t('invoiceDetail.cancelled'),
          });
          loadInvoice(invoice.id);
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: t('common.error'),
            detail: t('invoiceDetail.cancelError'),
          });
        }
      },
    });
  };

  const handleDelete = () => {
    if (!invoice) return;
    confirmDialog({
      message: t('invoiceDetail.deleteConfirm', { number: invoice.invoiceNumber }),
      header: t('common.confirmDelete'),
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await invoiceService.deleteInvoice(invoice.id);
          toast.current?.show({
            severity: 'success',
            summary: t('common.success'),
            detail: t('invoiceDetail.deleted'),
          });
          navigate('/invoices');
        } catch (error: any) {
          toast.current?.show({
            severity: 'error',
            summary: t('common.error'),
            detail: getApiErrorMessage(error, t('invoiceDetail.deleteError')),
          });
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' }> = {
      'PAID': { label: t('status.paid'), severity: 'success' },
      'PENDING': { label: t('status.pending'), severity: 'warning' },
      'PARTIAL': { label: t('status.partial'), severity: 'info' },
      'OVERDUE': { label: t('status.overdue'), severity: 'danger' },
      'CANCELLED': { label: t('status.cancelledF'), severity: 'danger' },
      'DRAFT': { label: t('status.draft'), severity: 'info' },
    };
    const s = statusMap[status] || { label: status, severity: 'info' };
    return <Tag value={s.label} severity={s.severity} className="text-lg" />;
  };

  const paymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'CASH': t('invoiceDetail.paymentMethods.cash'),
      'CARD': t('invoiceDetail.paymentMethods.card'),
      'CHECK': t('invoiceDetail.paymentMethods.check'),
      'TRANSFER': t('invoiceDetail.paymentMethods.transfer'),
      'INSURANCE': t('invoiceDetail.paymentMethods.insurance'),
      'MOBILE': t('invoiceDetail.paymentMethods.mobile'),
    };
    return labels[method] || method;
  };

  if (loading) {
    return <InvoiceDetailSkeleton />;
  }

  if (!invoice) {
    return (
      <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
        <i className="pi pi-exclamation-circle text-4xl text-orange-500 mb-3"></i>
        <h2>{t('invoiceDetail.notFound')}</h2>
        <Button label={t('invoiceDetail.backToList')} icon="pi pi-arrow-left" onClick={() => navigate('/invoices')} />
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
            label={t('common.back')}
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
              label={t('invoiceDetail.addPayment')}
              icon="pi pi-money-bill"
              className="p-button-success"
              onClick={openPaymentDialog}
            />
          )}
          {canCancel && (
            <Button
              label={t('common.cancel')}
              icon="pi pi-times-circle"
              className="p-button-secondary"
              onClick={handleCancel}
            />
          )}
          <Button
            label={t('common.delete')}
            icon="pi pi-trash"
            className="p-button-danger"
            onClick={handleDelete}
          />
          <Button
            label={t('common.print')}
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
                <h3 className="text-lg font-semibold m-0 mb-2">{t('invoiceDetail.billedTo')}</h3>
                <p className="m-0"><strong>{invoice.patient?.fullName || `${invoice.patient?.firstName} ${invoice.patient?.lastName}`}</strong></p>
                <p className="m-0 text-500">{(invoice.patient as any)?.address || ''}</p>
                <p className="m-0 text-500">{invoice.patient?.phone}</p>
              </div>
              <div className="text-right">
                <p className="m-0"><strong>{t('invoiceDetail.date')}:</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
                {invoice.dueDate && (
                  <p className="m-0"><strong>{t('invoiceDetail.dueDate')}:</strong> {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
            </div>

            <DataTable value={invoice.items || []} className="mb-4" emptyMessage={t('invoiceDetail.noItems')}>
              <Column field="description" header={t('invoiceDetail.description')} />
              <Column field="quantity" header={t('invoiceDetail.qty')} style={{ width: '5rem' }} />
              <Column
                field="unitPrice"
                header={t('invoiceDetail.unitPrice')}
                style={{ width: '8rem' }}
                body={(rowData) => `${parseFloat(rowData.unitPrice).toFixed(2)} ${getCurrency()}`}
              />
              <Column
                field="totalPrice"
                header={t('invoiceDetail.total')}
                style={{ width: '8rem' }}
                body={(rowData) => `${parseFloat(rowData.totalPrice).toFixed(2)} ${getCurrency()}`}
              />
            </DataTable>

            <div className="flex justify-content-end">
              <div className="w-15rem">
                <div className="flex justify-content-between mb-2">
                  <span>{t('invoiceDetail.subtotal')}</span>
                  <span>{parseFloat(invoice.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {getCurrency()}</span>
                </div>
                {parseFloat(invoice.discountAmount) > 0 && (
                  <div className="flex justify-content-between mb-2 text-orange-500">
                    <span>{t('invoiceDetail.discount')}</span>
                    <span>-{parseFloat(invoice.discountAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {getCurrency()}</span>
                  </div>
                )}
                <div className="flex justify-content-between mb-2">
                  <span>{t('invoiceDetail.tax')}</span>
                  <span>{parseFloat(invoice.taxAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {getCurrency()}</span>
                </div>
                <div className="flex justify-content-between mb-2 text-lg font-bold">
                  <span>{t('invoiceDetail.totalAmount')}</span>
                  <span>{parseFloat(invoice.totalAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {getCurrency()}</span>
                </div>
                <div className="flex justify-content-between mb-2 text-green-500">
                  <span>{t('invoiceDetail.paid')}</span>
                  <span>{parseFloat(invoice.paidAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {getCurrency()}</span>
                </div>
                <div className={`flex justify-content-between text-lg font-bold ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  <span>{t('invoiceDetail.balance')}</span>
                  <span>{balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {getCurrency()}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Payments */}
        <div className="col-12 lg:col-4">
          <Card className="shadow-2" title={t('invoiceDetail.payments')}>
            {(!invoice.payments || invoice.payments.length === 0) ? (
              <p className="text-500 text-center">{t('invoiceDetail.noPayments')}</p>
            ) : (
              <div className="flex flex-column gap-3">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="p-3 surface-100 border-round">
                    <div className="flex justify-content-between align-items-center">
                      <span className="font-semibold">{parseFloat(payment.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {getCurrency()}</span>
                      <Tag value={paymentMethodLabel(payment.paymentMethod)} />
                    </div>
                    <div className="text-sm text-500 mt-1">
                      {new Date(payment.paymentDate).toLocaleString('fr-FR')}
                    </div>
                    {payment.receivedBy && (
                      <div className="text-sm text-500">
                        {t('invoiceDetail.receivedBy', { name: payment.receivedBy.fullName || `${payment.receivedBy.firstName} ${payment.receivedBy.lastName}` })}
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
        header={t('invoiceDetail.paymentDialog.title')}
        className="w-11/12 md:w-5"
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label={t('common.cancel')}
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setPaymentDialogVisible(false)}
            />
            <Button
              label={t('common.save')}
              icon="pi pi-check"
              loading={submittingPayment}
              onClick={handleAddPayment}
            />
          </div>
        }
      >
        <div className="flex flex-column gap-3">
          <div className="field">
            <label className="block font-medium mb-2">{t('invoiceDetail.paymentDialog.amount')}</label>
            <InputText
              value={paymentData.amount || ''}
              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              className="w-full"
              placeholder="0.00"
            />
            <small className="text-500">{t('invoiceDetail.paymentDialog.remainingBalance', { balance: balance.toFixed(2), currency: getCurrency() })}</small>
          </div>
          <div className="field">
            <label className="block font-medium mb-2">{t('invoiceDetail.paymentDialog.method')}</label>
            <Dropdown
              value={paymentData.paymentMethod}
              options={[
                { label: t('invoiceDetail.paymentMethods.cash'), value: 'CASH' },
                { label: t('invoiceDetail.paymentMethods.card'), value: 'CARD' },
                { label: t('invoiceDetail.paymentMethods.check'), value: 'CHECK' },
                { label: t('invoiceDetail.paymentMethods.transfer'), value: 'TRANSFER' },
                { label: t('invoiceDetail.paymentMethods.insurance'), value: 'INSURANCE' },
                { label: t('invoiceDetail.paymentMethods.mobile'), value: 'MOBILE' },
              ]}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.value })}
              placeholder={t('common.select')}
              className="w-full"
            />
          </div>
          <div className="field">
            <label className="block font-medium mb-2">{t('invoiceDetail.paymentDialog.paymentDate')}</label>
            <Calendar
              value={paymentData.paymentDate ? new Date(paymentData.paymentDate) : null}
              onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.value?.toISOString().split('T')[0] })}
              dateFormat="dd/mm/yy"
              className="w-full"
              minDate={new Date()}
              showIcon
            />
          </div>
          {paymentData.paymentMethod === 'CHECK' && (
            <>
              <div className="field">
                <label className="block font-medium mb-2">{t('invoiceDetail.paymentDialog.checkNumber')}</label>
                <InputText
                  value={paymentData.checkNumber || ''}
                  onChange={(e) => setPaymentData({ ...paymentData, checkNumber: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="field">
                <label className="block font-medium mb-2">{t('invoiceDetail.paymentDialog.bank')}</label>
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
              <label className="block font-medium mb-2">{t('invoiceDetail.paymentDialog.transactionRef')}</label>
              <InputText
                value={paymentData.transactionReference || ''}
                onChange={(e) => setPaymentData({ ...paymentData, transactionReference: e.target.value })}
                className="w-full"
              />
            </div>
          )}
          <div className="field">
            <label className="block font-medium mb-2">{t('invoiceDetail.paymentDialog.notes')}</label>
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
