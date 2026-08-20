import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { FileUpload, type FileUploadSelectEvent } from 'primereact/fileupload';
import { documentService } from '@/features/pregnancy/api/documents.api';
import { authedFileUrl } from '@/features/pregnancy/utils/pregnancy.constants';
import { getApiErrorMessage } from '@/utils/errorUtils';
import type { Pregnancy, MedicalDocument } from '@/types';

interface Props {
    pregnancy: Pregnancy;
    onReload: () => void;
}

const DocumentsTab: React.FC<Props> = ({ pregnancy, onReload }) => {
    const { t } = useTranslation();
    const toast = useRef<Toast>(null);
    const documents = pregnancy.documents || [];

    const [dialogVisible, setDialogVisible] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [documentDate, setDocumentDate] = useState<string | undefined>();
    const [issuedBy, setIssuedBy] = useState('');
    const [isConfidential, setIsConfidential] = useState(false);
    const [ultrasoundId, setUltrasoundId] = useState<number | undefined>();
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setFile(null); setType(''); setTitle(''); setDescription(''); setDocumentDate(undefined);
        setIssuedBy(''); setIsConfidential(false); setUltrasoundId(undefined);
    };

    const openUpload = () => { resetForm(); setDialogVisible(true); };

    const handleUpload = async () => {
        if (!file || !type || !title) return;
        setSubmitting(true);
        try {
            await documentService.uploadDocument({
                file, patientId: pregnancy.patient.id, type, title, description: description || undefined,
                documentDate, issuedBy: issuedBy || undefined, isConfidential, pregnancyId: pregnancy.id, ultrasoundId,
            });
            toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.documents.uploaded') });
            setDialogVisible(false);
            onReload();
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error, t('pregnancy.documents.uploadError')) });
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (doc: MedicalDocument) => {
        confirmDialog({
            message: t('pregnancy.documents.deleteConfirm'),
            header: t('common.confirmDelete'),
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await documentService.deleteDocument(doc.id);
                    toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.documents.deleted') });
                    onReload();
                } catch (error) {
                    toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error, t('pregnancy.documents.deleteError')) });
                }
            },
        });
    };

    const openFile = async (doc: MedicalDocument, mode: 'preview' | 'download') => {
        const path = mode === 'preview' ? documentService.previewUrl(doc.id) : documentService.downloadUrl(doc.id);
        const url = await authedFileUrl(path);
        if (mode === 'preview') {
            window.open(url, '_blank');
        } else {
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.fileName || doc.title;
            a.click();
        }
    };

    return (
        <Card className="shadow-2">
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className="flex justify-content-end mb-3">
                <Button label={t('pregnancy.documents.upload')} icon="pi pi-upload" className="p-button-success" onClick={openUpload} />
            </div>
            <DataTable value={documents} paginator rows={10} emptyMessage={t('pregnancy.documents.noDocuments')}>
                <Column field="title" header={t('pregnancy.documents.form.title')} />
                <Column field="type" header={t('pregnancy.documents.form.type')} />
                <Column header={t('common.date')} body={(row: MedicalDocument) => row.documentDate ? new Date(row.documentDate).toLocaleDateString('fr-FR') : new Date(row.createdAt).toLocaleDateString('fr-FR')} />
                <Column
                    header={t('common.actions')}
                    body={(row: MedicalDocument) => (
                        <div className="flex gap-2">
                            <Button icon="pi pi-eye" className="p-button-rounded p-button-info p-button-sm" tooltip={t('pregnancy.documents.preview')} onClick={() => openFile(row, 'preview')} />
                            <Button icon="pi pi-download" className="p-button-rounded p-button-secondary p-button-sm" tooltip={t('pregnancy.documents.download')} onClick={() => openFile(row, 'download')} />
                            <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" onClick={() => confirmDelete(row)} />
                        </div>
                    )}
                />
            </DataTable>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={t('pregnancy.documents.upload')}
                className="w-11/12 md:w-6"
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label={t('common.cancel')} className="p-button-text" onClick={() => setDialogVisible(false)} />
                        <Button label={t('common.save')} icon="pi pi-check" loading={submitting} onClick={handleUpload} disabled={!file || !type || !title} />
                    </div>
                }
            >
                <div className="grid">
                    <div className="col-12 field">
                        <label className="block font-medium mb-2">{t('pregnancy.documents.form.file')}</label>
                        <FileUpload
                            mode="basic"
                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                            maxFileSize={10000000}
                            chooseLabel={file ? file.name : t('common.select')}
                            auto={false}
                            customUpload
                            onSelect={(e: FileUploadSelectEvent) => setFile(e.files[0])}
                        />
                    </div>
                    <div className="col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.documents.form.type')}</label>
                        <InputText value={type} onChange={(e) => setType(e.target.value)} className="w-full" />
                    </div>
                    <div className="col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.documents.form.title')}</label>
                        <InputText value={title} onChange={(e) => setTitle(e.target.value)} className="w-full" />
                    </div>
                    <div className="col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.documents.form.documentDate')}</label>
                        <Calendar value={documentDate ? new Date(documentDate) : null} onChange={(e) => setDocumentDate(e.value?.toISOString().slice(0, 10))} dateFormat="dd/mm/yy" className="w-full" showIcon />
                    </div>
                    <div className="col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.documents.form.issuedBy')}</label>
                        <InputText value={issuedBy} onChange={(e) => setIssuedBy(e.target.value)} className="w-full" />
                    </div>
                    <div className="col-6 field">
                        <label className="block font-medium mb-2">{t('pregnancy.documents.form.ultrasoundId')}</label>
                        <Dropdown
                            value={ultrasoundId ?? null}
                            options={(pregnancy.ultrasounds || []).map((u) => ({ label: `${t(`pregnancy.enums.ultrasoundType.${u.type}`)} — ${new Date(u.performedAt).toLocaleDateString('fr-FR')}`, value: u.id }))}
                            onChange={(e) => setUltrasoundId(e.value)}
                            className="w-full"
                            showClear
                        />
                    </div>
                    <div className="col-6 field flex align-items-center gap-2 mt-3">
                        <InputSwitch checked={isConfidential} onChange={(e) => setIsConfidential(e.value)} />
                        <label className="font-medium">{t('pregnancy.documents.form.isConfidential')}</label>
                    </div>
                    <div className="col-12 field">
                        <label className="block font-medium mb-2">{t('pregnancy.documents.form.description')}</label>
                        <textarea className="w-full p-inputtextarea p-inputtext" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                </div>
            </Dialog>
        </Card>
    );
};

export default DocumentsTab;
