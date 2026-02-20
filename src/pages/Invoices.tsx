import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceService } from '../services/invoiceService';
import { patientService } from '../services/patientService';
import { consultationService } from '../services/consultationService';
import { getApiErrorMessage } from '../utils/errorUtils';
import type { Invoice, Patient, Consultation } from '../types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';

interface InvoiceItemForm {
  description: string;
  quantity: number;
  unitPrice: string;
}

const emptyItem: InvoiceItemForm = { description: '', quantity: 1, unitPrice: '0' };

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
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
        summary: 'Erreur',
        detail: 'Impossible de charger les factures',
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
        summary: 'Erreur',
        detail: 'Erreur lors de la recherche',
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
          summary: 'Succès',
          detail: 'Facture mise à jour',
        });
      } else {
        await invoiceService.createInvoice(payload);
        toast.current?.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Facture créée',
        });
      }
      setDialogVisible(false);
      await loadInvoices();
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

  const confirmDelete = (invoice: Invoice) => {
    confirmDialog({
      message: `Êtes-vous sûr de vouloir supprimer la facture ${invoice.invoiceNumber} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => handleDelete(invoice),
    });
  };

  const handleDelete = async (invoice: Invoice) => {
    try {
      await invoiceService.deleteInvoice(invoice.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Facture supprimée',
      });
      loadInvoices();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: getApiErrorMessage(error, 'Impossible de supprimer la facture'),
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
      'PAID': { label: 'Payée', severity: 'success' },
      'PENDING': { label: 'En attente', severity: 'warning' },
      'PARTIAL': { label: 'Partielle', severity: 'info' },
      'OVERDUE': { label: 'En retard', severity: 'danger' },
      'CANCELLED': { label: 'Annulée', severity: 'danger' },
      'DRAFT': { label: 'Brouillon', severity: 'info' },
    };
    const status = statusMap[rowData.status] || { label: rowData.status, severity: 'info' };
    return <Tag value={status.label} severity={status.severity} />;
  };

  const amountBodyTemplate = (rowData: Invoice) => {
    return `${parseFloat(rowData.totalAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD`;
  };

  const balanceBodyTemplate = (rowData: Invoice) => {
    const balance = parseFloat(rowData.totalAmount) - parseFloat(rowData.paidAmount);
    return balance > 0 ? (
      <span className="text-red-500 font-semibold">{balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD</span>
    ) : (
      <span className="text-green-500">0 MAD</span>
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
      <Button
        icon="pi pi-print"
        className="p-button-rounded p-button-secondary p-button-sm"
        tooltip="Imprimer"
        onClick={() => handlePrint(rowData)}
      />
    </div>
  );

  const handlePrint = async (invoice: Invoice) => {
    try {
      const blob = await invoiceService.printInvoice(invoice.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      /* Optional: triggering direct download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      */
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible d\'imprimer la facture',
      });
    }
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
        label={editingInvoice ? 'Modifier' : 'Créer'}
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
        <h1 className="text-3xl font-bold m-0">Factures</h1>
        <Button
          label="Nouvelle facture"
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
            placeholder="Rechercher une facture..."
            className="w-full"
            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
          />
        </span>
        <Button icon="pi pi-search" onClick={handleSearch} />
        <Button icon="pi pi-refresh" className="p-button-secondary" onClick={loadInvoices} />
      </div>

      {/* Invoices Table */}
      <DataTable
        value={invoices}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="Aucune facture trouvée"
        className="shadow-2"
      >
        <Column field="invoiceNumber" header="N° Facture" sortable />
        <Column field="patient.fullName" header="Patient" sortable body={patientFullName} />
        <Column field="invoiceDate" header="Date" body={dateBodyTemplate} sortable />
        <Column field="totalAmount" header="Montant" body={amountBodyTemplate} sortable />
        <Column field="balance" header="Solde" body={balanceBodyTemplate} />
        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
        <Column body={actionBodyTemplate} header="Actions" style={{ width: '12rem' }} />
      </DataTable>

      {/* Invoice Dialog */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header={editingInvoice ? 'Modifier la facture' : 'Nouvelle facture'}
        className="w-11/12 md:w-8 lg:w-8"
        footer={dialogFooter}
      >
        <div className="grid">
          {/* Patient */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Patient *</label>
            <Dropdown
              value={formData.patientId}
              options={patients.map((p) => ({ label: `${p.firstName} ${p.lastName}`, value: p.id }))}
              onChange={(e) => setFormData({ ...formData, patientId: e.value })}
              placeholder="Sélectionner un patient"
              className="w-full"
              filter
              filterPlaceholder="Rechercher..."
              disabled={!!editingInvoice}
            />
          </div>

          {/* Consultation */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Consultation</label>
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
              showClear
              itemTemplate={(option: Consultation) => {
                const patient = option.patient;
                const patientName = patient ? `${patient.lastName} ${patient.firstName}` : 'N/A';
                const date = new Date(option.createdAt).toLocaleDateString('fr-FR');
                return <span>{option.referenceNumber} — {patientName} — {option.reason || 'Sans motif'} ({date})</span>;
              }}
              valueTemplate={(value: any) => {
                if (!value) return <span>Sélectionner une consultation</span>;
                const consultation = typeof value === 'object'
                  ? value as Consultation
                  : consultations.find((c: Consultation) => c.id === value);
                if (!consultation) return <span>Consultation #{value}</span>;
                const patient = consultation.patient;
                const patientName = patient ? `${patient.lastName} ${patient.firstName}` : 'N/A';
                return <span>{consultation.referenceNumber} — {patientName} — {consultation.reason || 'Sans motif'}</span>;
              }}
            />
          </div>

          {/* Status */}
          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">Statut</label>
            <Dropdown
              value={formData.status}
              options={[
                { label: 'Brouillon', value: 'DRAFT' },
                { label: 'En attente', value: 'PENDING' },
                { label: 'Payée', value: 'PAID' },
                { label: 'Partielle', value: 'PARTIAL' },
                { label: 'En retard', value: 'OVERDUE' },
                { label: 'Annulée', value: 'CANCELLED' },
              ]}
              onChange={(e) => setFormData({ ...formData, status: e.value })}
              placeholder="Sélectionner"
              className="w-full"
            />
          </div>

          {/* Invoice Date */}
          <div className="col-12 md:col-4 field">
            <label className="block font-medium mb-2">Date de facture *</label>
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
            <label className="block font-medium mb-2">Date d'échéance</label>
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
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Remise (MAD)</label>
            <InputText
              value={formData.discountAmount || '0'}
              onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
              className="w-full"
              placeholder="0.00"
            />
          </div>

          {/* Notes */}
          <div className="col-12 md:col-6 field">
            <label className="block font-medium mb-2">Notes</label>
            <InputTextarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full"
              rows={2}
              autoResize
            />
          </div>

          {/* Line Items */}
          <div className="col-12">
            <div className="flex justify-content-between align-items-center mb-3 mt-2">
              <h3 className="text-lg font-semibold m-0">Lignes de facture</h3>
              <Button
                label="Ajouter une ligne"
                icon="pi pi-plus"
                className="p-button-outlined p-button-sm"
                onClick={addItem}
              />
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid align-items-end mb-2">
                <div className="col-12 md:col-5 field mb-0">
                  {index === 0 && <label className="block font-medium mb-2">Description</label>}
                  <InputText
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full"
                    placeholder="Description de l'article"
                  />
                </div>
                <div className="col-4 md:col-2 field mb-0">
                  {index === 0 && <label className="block font-medium mb-2">Quantité</label>}
                  <InputNumber
                    value={item.quantity}
                    onValueChange={(e) => updateItem(index, 'quantity', e.value || 1)}
                    className="w-full"
                    min={1}
                  />
                </div>
                <div className="col-4 md:col-2 field mb-0">
                  {index === 0 && <label className="block font-medium mb-2">Prix unit.</label>}
                  <InputText
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                    className="w-full"
                    placeholder="0.00"
                  />
                </div>
                <div className="col-3 md:col-2 field mb-0">
                  {index === 0 && <label className="block font-medium mb-2">Total</label>}
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
                  <span>Sous-total:</span>
                  <span className="font-semibold">{calculateSubtotal().toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-content-between mb-2">
                  <span>Remise:</span>
                  <span className="text-orange-500">-{parseFloat(formData.discountAmount || '0').toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-content-between text-lg font-bold border-top-1 surface-border pt-2">
                  <span>Total:</span>
                  <span>{(calculateSubtotal() - parseFloat(formData.discountAmount || '0')).toFixed(2)} MAD</span>
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
