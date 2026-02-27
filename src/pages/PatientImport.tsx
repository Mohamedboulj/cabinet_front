import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { getApiErrorMessage } from '../utils/errorUtils';
import { Steps } from 'primereact/steps';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Message } from 'primereact/message';
import { ProgressBar } from 'primereact/progressbar';
import { FileUpload, type FileUploadSelectEvent } from 'primereact/fileupload';
import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';


interface ValidationError {
    row: number;
    field: string;
    message: string;
}

interface FieldChange {
    field: string;
    oldValue: string;
    newValue: string;
}

interface UpdatedPatient {
    fullName: string;
    changes: FieldChange[];
}

interface CreatedPatient {
    fullName: string;
}

interface ImportResult {
    message: string;
    created: number;
    updated: number;
    createdPatients: CreatedPatient[];
    updatedPatients: UpdatedPatient[];
}

const PatientImport: React.FC = () => {
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);
    const fileUploadRef = useRef<FileUpload>(null);

    const [activeStep, setActiveStep] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);

    // Step 2 data
    const [_parsedRows, setParsedRows] = useState<any[]>([]);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [isValid, setIsValid] = useState(false);
    const [totalRows, setTotalRows] = useState(0);

    // Import result (step 3)
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    // Step 1 error
    const [uploadError, setUploadError] = useState<string | null>(null);

    const stepItems = [
        { label: 'Télécharger le fichier' },
        { label: 'Vérifier & Valider' },
        { label: 'Confirmer l\'import' },
    ];

    const handleFileSelect = (e: FileUploadSelectEvent) => {
        const file = e.files?.[0] || null;
        setSelectedFile(file);
        setUploadError(null);
    };

    const handleFileClear = () => {
        setSelectedFile(null);
        setUploadError(null);
    };

    const handleValidate = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setUploadError(null);

        try {
            const response = await patientService.validateImportFile(selectedFile);
            const data = response.data;

            setParsedRows(data.data || []);
            setTotalRows(data.total_rows || data.data?.length || 0);
            setValidationErrors([]);
            setIsValid(true);
            setActiveStep(1);
        } catch (error: any) {
            const status = error?.response?.status;

            if (status === 400) {
                // Header/format error — stay on Step 1
                const data = error.response?.data;
                let detail = data?.error || data?.detail || data?.message || 'Format de fichier invalide';

                if (data?.missing_headers?.length) {
                    detail += `\nEn-têtes manquants : ${data.missing_headers.join(', ')}`;
                }
                if (data?.extra_headers?.length) {
                    detail += `\nEn-têtes en trop : ${data.extra_headers.join(', ')}`;
                }

                setUploadError(detail);
            } else if (status === 422) {
                // Validation errors — move to Step 2 with errors
                const data = error.response?.data;
                setParsedRows(data?.data || []);
                setTotalRows(data?.total_rows || data?.data?.length || 0);
                setValidationErrors(data?.errors || []);
                setIsValid(false);
                setActiveStep(1);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: getApiErrorMessage(error, 'Erreur lors de la validation'),
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!selectedFile) return;

        setImporting(true);

        try {
            const response = await patientService.importPatients(selectedFile);
            const data = response.data as ImportResult;

            setImportResult(data);
            setActiveStep(3);

            toast.current?.show({
                severity: 'success',
                summary: 'Succès',
                detail: data.message || 'Import réussi',
                life: 4000,
            });
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: getApiErrorMessage(error, 'Erreur lors de l\'import'),
            });
        } finally {
            setImporting(false);
        }
    };

    const goBack = () => {
        if (activeStep === 1) {
            // Reset step 2 state when going back
            setParsedRows([]);
            setValidationErrors([]);
            setIsValid(false);
            setActiveStep(0);
        } else if (activeStep === 2) {
            setActiveStep(1);
        }
    };

    // ─── Step 1: Upload ─────────────────────────────────────────────

    const renderStep1 = () => (
        <div className="flex flex-column gap-4">
            <Message
                severity="info"
                className="w-full"
                content={
                    <div className="flex align-items-center justify-content-between w-full gap-3">
                        <span>Téléchargez le modèle Excel pour remplir vos données patients.</span>
                        <a href="../../../public/template/patient_import_template.xlsx" download>
                            <Button
                                label="Télécharger le modèle"
                                icon="pi pi-download"
                                className="p-button-sm p-button-outlined"
                                type="button"
                            />
                        </a>
                    </div>
                }
            />

            <div className="flex flex-column align-items-center gap-3 p-4 border-1 border-dashed border-300 border-round">
                <i className="pi pi-file-excel text-6xl text-green-500"></i>
                <FileUpload
                    ref={fileUploadRef}
                    mode="basic"
                    accept=".xlsx,.xls"
                    maxFileSize={10000000}
                    chooseLabel={selectedFile ? selectedFile.name : 'Choisir un fichier Excel'}
                    chooseOptions={{
                        icon: 'pi pi-upload',
                        className: selectedFile ? 'p-button-outlined p-button-success' : '',
                    }}
                    auto={false}
                    customUpload
                    onSelect={handleFileSelect}
                    onClear={handleFileClear}
                />
                {selectedFile && (
                    <div className="flex align-items-center gap-2">
                        <span className="text-500 text-sm">
                            <i className="pi pi-file mr-1"></i>
                            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} Ko)
                        </span>
                        <Button
                            icon="pi pi-trash"
                            className="p-button-rounded p-button-danger p-button-text p-button-sm"
                            onClick={() => {
                                setSelectedFile(null);
                                setUploadError(null);
                                fileUploadRef.current?.clear();
                            }}
                            tooltip="Supprimer le fichier"
                            tooltipOptions={{ position: 'top' }}
                        />
                    </div>
                )}
            </div>

            {uploadError && (
                <Message severity="error" className="w-full" text={uploadError} />
            )}
        </div>
    );

    // ─── Step 2: Review & Validate ──────────────────────────────────

    const renderStep2 = () => (
        <div className="flex flex-column gap-4">
            {isValid ? (
                <Message
                    severity="success"
                    className="w-full"
                    text={`Les ${totalRows} lignes sont valides`}
                />
            ) : (
                <>
                    <Message
                        severity="error"
                        className="w-full"
                        text={`${validationErrors.length} erreur(s) de validation trouvée(s). Corrigez le fichier et réessayez.`}
                    />
                    <h3 className="m-0">Erreurs de validation</h3>
                    <DataTable
                        value={validationErrors}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[10, 25, 50]}
                        emptyMessage="Aucune erreur"
                        className="shadow-2"
                        size="small"
                    >
                        <Column field="row" header="Ligne" sortable style={{ width: '6rem' }} />
                        <Column field="field" header="Champ" sortable />
                        <Column field="message" header="Message" />
                    </DataTable>
                </>
            )}
        </div>
    );

    // ─── Step 3: Confirm ───────────────────────────────────────────

    const renderStep3 = () => (
        <div className="flex flex-column align-items-center gap-4 p-6">
            <i className="pi pi-check-circle text-8xl text-green-500"></i>
            <h2 className="m-0 text-center">
                {totalRows} patients prêts à importer
            </h2>
            <p className="text-500 text-center m-0">
                Cliquez sur "Importer" pour lancer l'import. Cette action est irréversible.
            </p>

            {importing && (
                <div className="w-full">
                    <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
                    <p className="text-center text-500 mt-2">Import en cours…</p>
                </div>
            )}
        </div>
    );

    // ─── Step 4: Import Result ──────────────────────────────────────

    const renderStep4 = () => {
        if (!importResult) return null;

        return (
            <div className="flex flex-column gap-4">
                <div className="flex flex-column align-items-center gap-3 p-4">
                    <i className="pi pi-check-circle text-6xl text-green-500"></i>
                    <h2 className="m-0 text-center">{importResult.message}</h2>
                </div>

                <Accordion multiple>
                    {importResult.created > 0 && (
                        <AccordionTab
                            header={`${importResult.created} patient(s) créé(s)`}
                            pt={{
                                headerAction: {
                                    className: 'bg-green-100'
                                },
                                content: { className: 'bg-green-50' }
                            }}
                        >
                            {importResult.createdPatients.map((patient, idx) => (
                                <p key={idx} className="m-0 mb-2">
                                    Le patient <strong>{patient.fullName}</strong> est créé.
                                </p>
                            ))}
                        </AccordionTab>
                    )}

                    {importResult.updated > 0 && (
                        <AccordionTab
                            header={`${importResult.updated} patient(s) modifié(s)`}
                            pt={{
                                headerAction: {
                                    className: 'bg-orange-100'
                                },
                                content: { className: 'bg-orange-50' }
                            }}
                        >
                            {importResult.updatedPatients.map((patient, idx) => (
                                <div key={idx} className="mb-3">
                                    <p className="m-0 font-semibold">{patient.fullName}</p>
                                    <ul className="mt-1 mb-0 pl-4">
                                        {patient.changes.map((change, cIdx) => (
                                            <li key={cIdx}>
                                                <strong>{change.field}</strong> : {change.oldValue} → {change.newValue}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </AccordionTab>
                    )}
                </Accordion>
            </div>
        );
    };

    // ─── Footer buttons ────────────────────────────────────────────

    const renderFooter = () => {
        const isProcessing = loading || importing;

        return (
            <div className="flex justify-content-between pt-4">
                <div>
                    {activeStep > 0 && activeStep < 3 && (
                        <Button
                            label="Précédent"
                            icon="pi pi-arrow-left"
                            className="p-button-text"
                            onClick={goBack}
                            disabled={isProcessing}
                        />
                    )}
                </div>
                <div className="flex gap-2">
                    {activeStep < 3 && (
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            className="p-button-text p-button-secondary"
                            onClick={() => navigate('/patients')}
                            disabled={isProcessing}
                        />
                    )}
                    {activeStep === 0 && (
                        <Button
                            label="Suivant"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            onClick={handleValidate}
                            loading={loading}
                            disabled={!selectedFile || isProcessing}
                        />
                    )}
                    {activeStep === 1 && (
                        <Button
                            label="Suivant"
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            onClick={() => setActiveStep(2)}
                            disabled={!isValid || isProcessing}
                        />
                    )}
                    {activeStep === 2 && (
                        <Button
                            label="Importer"
                            icon="pi pi-download"
                            className="p-button-success"
                            onClick={handleImport}
                            loading={importing}
                            disabled={isProcessing}
                        />
                    )}
                    {activeStep === 3 && (
                        <>
                            <Button
                                label="Nouvel import"
                                icon="pi pi-upload"
                                className="p-button-outlined"
                                onClick={() => {
                                    setActiveStep(0);
                                    setSelectedFile(null);
                                    setParsedRows([]);
                                    setValidationErrors([]);
                                    setIsValid(false);
                                    setTotalRows(0);
                                    setImportResult(null);
                                    setUploadError(null);
                                    fileUploadRef.current?.clear();
                                }}
                            />
                            <Button
                                label="Terminer"
                                icon="pi pi-check"
                                className="p-button-primary"
                                onClick={() => navigate('/patients')}
                            />
                        </>
                    )}
                </div>
            </div>
        );
    };

    // ─── Main render ───────────────────────────────────────────────

    return (
        <div>
            <Toast ref={toast} />

            <div className="flex justify-content-between align-items-center mb-4">
                <h1 className="text-3xl font-bold m-0">Import de Patients</h1>
                <Button
                    label="Retour à la liste"
                    icon="pi pi-arrow-left"
                    className="p-button-text"
                    onClick={() => navigate('/patients')}
                />
            </div>

            <Card>
                <Steps
                    model={stepItems}
                    activeIndex={activeStep}
                    readOnly
                    className="mb-5"
                />

                {activeStep === 0 && renderStep1()}
                {activeStep === 1 && renderStep2()}
                {activeStep === 2 && renderStep3()}
                {activeStep === 3 && renderStep4()}

                {renderFooter()}
            </Card>
        </div>
    );
};

export default PatientImport;