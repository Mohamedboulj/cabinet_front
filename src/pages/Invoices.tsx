import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceService } from '../services/invoiceService';
import { patientService } from '../services/patientService';
import { consultationService } from '../services/consultationService';
import { getApiErrorMessage } from '../utils/errorUtils';
import { getCurrency } from '../utils/currencyUtils';
import type { Invoice, Patient, Consultation } from '../types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import DataTableSkeleton from '../components/skeletons/DataTableSkeleton';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { useTranslation } from 'react-i18next';

interface InvoiceItemForm {
  description: string;
  quantity: number;
  unitPrice: string;
}

const emptyItem: InvoiceItemForm = { description: '', quantity: 1, unitPrice: '0' };

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [items, setItems] = useState<InvoiceItemForm[]>([{ ...emptyItem }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInvoices();
    loadPatients();
    loadConsultations();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoiceService.getInvoices();
      setInvoices(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('invoices.loadError'),
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

  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients();
      setPatients(response.data);
    } catch (error) {
      // Silent fail
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadInvoices();
      return;
    }

    setLoading(true);
    try {
      const response = await invoiceService.getInvoices({ search: searchQuery });
      setInvoices(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('invoices.searchError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const openNewDialog = () => {
    setEditingInvoice(null);
    setFormData({
      invoiceDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      discountAmount: '0',
    });
    setItems([{ ...emptyItem }]);
    setDialogVisible(true);
  };

  const openEditDialog = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      patientId: invoice.patient?.id,
      consultationId: invoice.consultation?.id,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      notes: invoice.notes,
      discountAmount: invoice.discountAmount || '0',
      status: invoice.status,
    });
    setItems(
      invoice.items && invoice.items.length > 0
        ? invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
        : [{ ...emptyItem }]
    );
    setDialogVisible(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        items: items.filter((item) => item.description.trim() !== ''),
      };

      if (editingInvoice) {
        await invoiceService.updateInvoice(editingInvoice.id, payload);
        toast.current?.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('invoices.updated'),
        });
      } else {
        await invoiceService.createInvoice(payload);
        toast.current?.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('invoices.created'),
        });
      }
      setDialogVisible(false);
      await loadInvoices();
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

  const confirmDelete = (invoice: Invoice) => {
    confirmDialog({
      message: t('invoices.confirmDeleteMessage', { number: invoice.invoiceNumber }),
      header: t('common.confirmDelete'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleDelete(invoice),
    });
  };

  const handleDelete = async (invoice: Invoice) => {
    try {
      await invoiceService.deleteInvoice(invoice.id);
      toast.current?.show({
        severity: 'success',
        summary: t('common.success'),
        detail: t('invoices.deleted'),
      });
      loadInvoices();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: getApiErrorMessage(error, t('invoices.deleteError')),
      });
    }
  };

  // Dynamic items management
  const addItem = () => {
    setItems([...items, { ...emptyItem }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItemForm, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = (): number => {
    return items.reduce((sum, item) => {
      return sum + item.quantity * parseFloat(item.unitPrice || '0');
    }, 0);
  };

  // Body templates
  const statusBodyTemplate = (rowData: Invoice) => {
    const statusMap: Record<string, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' }> = {
      'PAID': { label: t('status.paid'), severity: 'success' },
      'PENDING': { label: t('status.pending'), severity: 'warning' },
      'PARTIAL': { label: t('status.partial'), severity: 'info' },
      'OVERDUE': { label: t('status.overdue'), severity: 'danger' },
      'CANCELLED': { label: t('status.cancelledF'), severity: 'danger' },
      'DRAFT': { label: t('status.draft'), severity: 'info' },
    };
    const status = statusMap[rowData.status] || { label: rowData.status, severity: 'info' };
    return <Tag value={status.label} severity={status.severity} />;
  };

  const amountBodyTemplate = (rowData: Invoice) => {
    return `${parseFloat(rowData.totalAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${getCurrency()}`;
  };

  const balanceBodyTemplate = (rowData: Invoice) => {
    const balance = parseFloat(rowData.totalAmount) - parseFloat(rowData.paidAmount);
    return balance > 0 ? (
      <span className="text-red-500 font-semibold">{balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {getCurrency()}</span>
    ) : (
      <span className="text-green-500">0 {getCurrency()}</span>
    );
  };

  const patientFullName = (rowData: any) =>
    `${rowData.patient.lastName} ${rowData.patient.firstName}`;

  const dateBodyTemplate = (rowData: Invoice) => {
    return new Date(rowData.invoiceDate).toLocaleDateString('fr-FR');
  };

  const actionBodyTemplate = (rowData: Invoice) => (
    <div className="flex gap-1">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-info p-button-sm"
        onClick={() => navigate(`/invoices/${rowData.id}`)}
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
        onClick={() => window.open(`/invoices/${rowData.id}`, '_blank')}
      />
    </div>
  );


  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label={t('common.cancel')}
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setDialogVisible(false)}
      />
      <Button
        label={editingInvoice ? t('common.edit') : t('common.create')}
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
        <h1 className="text-3xl font-bold m-0">{t('invoices.title')}</h1>
        <Button
          label={t('invoices.newInvoice')}
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
            placeholder={t('invoices.searchPlaceholder')}
            className="w-full"
            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          />
        </span>
        <Button icon="pi pi-search" onClick={handleSearch} />
        <Button icon="pi pi-refresh" className="p-button-secondary" onClick={loadInvoices} />
      </div>

      {/* Invoices Table */}
      {loading ? (
        <DataTableSkeleton headers={[t('invoices.headers.number'), t('invoices.headers.patient'), t('invoices.headers.date'), t('invoices.headers.amount'), t('invoices.headers.balance'), t('invoices.headers.status'), t('invoices.headers.actions')]} />
      ) : (
        <DataTable
          value={invoices}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage={t('invoices.noInvoices')}
          className="shadow-2"
        >
          <Column field="invoiceNumber" header={t('invoices.headers.number')} sortable />
          <Column field="patient.fullName" header={t('invoices.headers.patient')} sortable body={patientFullName} />
          <Column field="invoiceDate" header={t('invoices.headers.date')} body={dateBodyTemplate} sortable />
          <Column field="totalAmount" header={t('invoices.headers.amount')} body={amountBodyTemplate} sortable />
          <Column field="balance" header={t('invoices.headers.balance')} body={balanceBodyTemplate} />
          <Column field="status" header={t('invoices.headers.status')} body={statusBodyTemplate} sortable />
          <Column body={actionBodyTemplate} header={t('invoices.headers.actions')} style={{ width: '12rem' }} />
        </DataTable>
      )}

      {/* Invoice Dialog */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header={editingInvoice ? t('invoices.editDialog') : t('invoices.newDialog')}
        className="w-11/12 md:w-8 lg:w-8"
        footer={dialogFooter}
      >
        <div className="grid">
          {/* Consultation */}
          <div className="col-12 md:col-8 field">
            <label className="block font-medium mb-2">{t('invoices.form.consultation')}</label>
            <Dropdown
              value={formData.consultationId}
              options={consultations}
              optionLabel="reason"
              optionValue="id"
              onChange={(e) => setFormData({ ...formData, consultationId: e.value })}
              placeholder={t('invoices.form.selectConsultation')}
              className="w-full"
              filter
              filterPlaceholder={t('common.searchPlaceholder')}
              showClear
              itemTemplate={(option: Consultation) => {
                const patient = option.patient;
                const patientName = patient ? `${patient.lastName} ${patient.firstName}` : 'N/A';
                const date = new Date(option.createdAt).toLocaleDateString('fr-FR');
                return <span>{option.referenceNumber} — {patientName} — {option.reason || t('invoices.form.noReason')} ({date})</span>;
              }}
              valueTemplate={(value: any) => {
                if (!value) return <span>{t('invoices.form.selectConsultation')}</span>;
                const consultation = typeof value === 'object'
                  ? value as Consultation
                  : consultations.find((c: Consultation) => c.id === value);
                if (!consultation) return <span>Consultation #{value}</span>;
                const patient = consultation.patient;
                const patientName = patient ? `${patient.lastName} ${patient.firstName}` : 'N/A';
                return <span>{consultation.referenceNumber} — {patientName} — {consultation.reason || t('invoices.form.noReason')}</span>;
              }}
            />
          </div>

          {/* Status */}
          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">{t('invoices.form.status')}</label>
            <Dropdown
              value={formData.status}
              options={[
                { label: t('status.draft'), value: 'DRAFT' },
                { label: t('status.pending'), value: 'PENDING' },
                { label: t('status.paid'), value: 'PAID' },
                { label: t('status.partial'), value: 'PARTIAL' },
                { label: t('status.overdue'), value: 'OVERDUE' },
                { label: t('status.cancelledF'), value: 'CANCELLED' },
              ]}
              onChange={(e) => setFormData({ ...formData, status: e.value })}
              placeholder={t('common.select')}
              className="w-full"
            />
          </div>

          {/* Invoice Date */}
          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">{t('invoices.form.invoiceDate')}</label>
            <Calendar
              value={formData.invoiceDate ? new Date(formData.invoiceDate) : null}
              onChange={(e) => setFormData({ ...formData, invoiceDate: e.value?.toISOString().split('T')[0] })}
              dateFormat="dd/mm/yy"
              className="w-full"
              minDate={new Date()}
              showIcon
            />
          </div>

          {/* Due Date */}
          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">{t('invoices.form.dueDate')}</label>
            <Calendar
              value={formData.dueDate ? new Date(formData.dueDate) : null}
              onChange={(e) => setFormData({ ...formData, dueDate: e.value?.toISOString().split('T')[0] })}
              dateFormat="dd/mm/yy"
              className="w-full"
              minDate={new Date()}
              showIcon
            />
          </div>

          {/* Discount */}
          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">{t('invoices.form.discount', { currency: getCurrency() })}</label>
            <InputText
              value={formData.discountAmount || '0'}
              onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
              className="w-full"
              placeholder="0.00"
            />
          </div>

          {/* Notes */}
          <div className="col-12 md:col-12 field">
            <label className="block font-medium mb-2">{t('invoices.form.notes')}</label>
            <InputTextarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full"
              rows={3}
              autoResize
            />
          </div>

          {/* Line Items */}
          <div className="col-12">
            <div className="flex justify-content-between align-items-center mb-3 mt-2">
              <h3 className="text-lg font-semibold m-0">{t('invoices.form.lineItems')}</h3>
              <Button
                label={t('invoices.form.addLine')}
                icon="pi pi-plus"
                className="p-button-outlined p-button-sm"
                onClick={addItem}
              />
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid align-items-end mb-2">
                <div className="col-12 md:col-5 field mb-0">
                  {index === 0 && <label className="block font-medium mb-2">{t('invoices.form.description')}</label>}
                  <InputText
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full"
                    placeholder={t('invoices.form.descriptionPlaceholder')}
                  />
                </div>
                <div className="col-4 md:col-2 field mb-0">
                  {index === 0 && <label className="block font-medium mb-2">{t('invoices.form.quantity')}</label>}
                  <InputNumber
                    value={item.quantity}
                    onValueChange={(e) => updateItem(index, 'quantity', e.value || 1)}
                    className="w-full"
                    min={1}
                  />
                </div>
                <div className="col-4 md:col-2 field mb-0">
                  {index === 0 && <label className="block font-medium mb-2">{t('invoices.form.unitPrice')}</label>}
                  <InputText
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                    className="w-full"
                    placeholder="0.00"
                  />
                </div>
                <div className="col-3 md:col-2 field mb-0">
                  {index === 0 && <label className="block font-medium mb-2">{t('invoices.form.total')}</label>}
                  <InputText
                    value={(item.quantity * parseFloat(item.unitPrice || '0')).toFixed(2)}
                    className="w-full"
                    disabled
                  />
                </div>
                <div className="col-1 field mb-0">
                  {index === 0 && <label className="block font-medium mb-2">&nbsp;</label>}
                  <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger p-button-text p-button-sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-content-end mt-3">
              <div className="w-15rem">
                <div className="flex justify-content-between mb-2">
                  <span>{t('invoices.form.subtotal')}</span>
                  <span className="font-semibold">{calculateSubtotal().toFixed(2)} {getCurrency()}</span>
                </div>
                <div className="flex justify-content-between mb-2">
                  <span>{t('invoices.form.discountLabel')}</span>
                  <span className="text-orange-500">-{parseFloat(formData.discountAmount || '0').toFixed(2)} {getCurrency()}</span>
                </div>
                <div className="flex justify-content-between text-lg font-bold border-top-1 surface-border pt-2">
                  <span>{t('invoices.form.totalLabel')}</span>
                  <span>{(calculateSubtotal() - parseFloat(formData.discountAmount || '0')).toFixed(2)} {getCurrency()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Invoices;
