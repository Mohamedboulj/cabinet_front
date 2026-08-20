import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Steps } from 'primereact/steps';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { InputSwitch } from 'primereact/inputswitch';
import { AutoComplete } from 'primereact/autocomplete';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import { patientService } from '@/features/patients/api/patients.api';
import { userService } from '@/features/users/api/users.api';
import { pregnancyService, pregnancyToolsService, type CreatePregnancyPayload } from '@/features/pregnancy/api/pregnancy.api';
import { getApiErrorMessage } from '@/utils/errorUtils';
import {
    BLOOD_GROUP_OPTIONS, RHESUS_OPTIONS, RISK_LEVEL_OPTIONS, RISK_FACTOR_OPTIONS,
} from '@/features/pregnancy/utils/pregnancy.constants';
import type { Patient, User } from '@/types';

const PregnancyWizard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);

    const [activeStep, setActiveStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patientSuggestions, setPatientSuggestions] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<User[]>([]);
    const [ongoingConflict, setOngoingConflict] = useState(false);

    const [eddPreview, setEddPreview] = useState<{ edd: string; gestationalAge: string } | null>(null);
    const [eddPreviewError, setEddPreviewError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<CreatePregnancyPayload>>({
        gravida: 1, para: 0, abortions: 0, livingChildren: 0, isMultiple: false, fetusCount: 1,
    });

    useEffect(() => {
        userService.getDoctors().then((res) => {
            setDoctors(res.data.filter((u) => u.roles.includes('ROLE_MEDECIN') && u.isActive));
        }).catch(() => setDoctors([]));
    }, []);

    useEffect(() => {
        if (!formData.lmp) {
            setEddPreview(null);
            return;
        }
        pregnancyToolsService.getEdd(formData.lmp)
            .then((res) => { setEddPreview({ edd: res.edd, gestationalAge: res.gestationalAge }); setEddPreviewError(null); })
            .catch(() => { setEddPreview(null); setEddPreviewError(t('pregnancy.tools.eddError')); });
    }, [formData.lmp, t]);

    const searchPatients = async (event: { query: string }) => {
        if (event.query.length < 2) { setPatientSuggestions([]); return; }
        try {
            const response = await patientService.searchPatients(event.query);
            setPatientSuggestions(response.data.map((p) => ({ ...p, fullName: `${p.firstName} ${p.lastName}` })));
        } catch {
            setPatientSuggestions([]);
        }
    };

    const openExistingPregnancy = async () => {
        if (!selectedPatient) return;
        try {
            const res = await pregnancyService.getPregnancies({ patientId: selectedPatient.id, status: 'ONGOING' });
            if (res.data.length > 0) navigate(`/pregnancies/${res.data[0].id}`);
        } catch {
            // ignore
        }
    };

    const stepItems = [
        { label: t('pregnancy.wizard.steps.patient') },
        { label: t('pregnancy.wizard.steps.dating') },
        { label: t('pregnancy.wizard.steps.details') },
    ];

    const canGoNext = () => {
        if (activeStep === 0) return !!selectedPatient;
        if (activeStep === 1) return !!formData.lmp;
        return true;
    };

    const handleSubmit = async () => {
        if (!selectedPatient || !formData.lmp) return;
        setSubmitting(true);
        setOngoingConflict(false);
        try {
            const payload: CreatePregnancyPayload = {
                ...formData,
                patientId: selectedPatient.id,
                lmp: formData.lmp,
            } as CreatePregnancyPayload;
            const res = await pregnancyService.createPregnancy(payload);
            toast.current?.show({ severity: 'success', summary: t('common.success'), detail: t('pregnancy.created') });
            navigate(`/pregnancies/${res.data.id}`);
        } catch (error: any) {
            const status = error?.response?.status;
            const apiError = error?.response?.data?.error;
            if (status === 409) {
                setOngoingConflict(true);
                toast.current?.show({ severity: 'error', summary: t('common.error'), detail: t('pregnancy.existingOngoing') });
            } else if (status === 400 && apiError?.includes('female')) {
                toast.current?.show({ severity: 'error', summary: t('common.error'), detail: t('pregnancy.onlyFemale') });
            } else {
                toast.current?.show({ severity: 'error', summary: t('common.error'), detail: getApiErrorMessage(error) });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const renderPatientStep = () => (
        <div className="grid">
            <div className="col-12 md:col-6 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.selectPatient')}</label>
                <AutoComplete
                    value={selectedPatient}
                    suggestions={patientSuggestions}
                    completeMethod={searchPatients}
                    field="fullName"
                    onChange={(e) => { setSelectedPatient(e.value); setOngoingConflict(false); }}
                    placeholder={t('pregnancy.wizard.selectPatient')}
                    className="w-full"
                    inputClassName="w-full"
                />
                {selectedPatient?.gender === 'M' && (
                    <Message severity="error" text={t('pregnancy.onlyFemale')} className="w-full mt-2" />
                )}
            </div>
            <div className="col-12 md:col-6 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.doctor')}</label>
                <Dropdown
                    value={formData.doctorId || null}
                    options={doctors.map((d) => ({ label: d.fullName || `${d.firstName} ${d.lastName}`, value: d.id }))}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.value })}
                    placeholder={t('common.select')}
                    className="w-full"
                    showClear
                />
            </div>
            {ongoingConflict && (
                <div className="col-12">
                    <Message
                        severity="warn"
                        className="w-full"
                        content={
                            <div className="flex justify-content-between align-items-center w-full">
                                <span>{t('pregnancy.existingOngoing')}</span>
                                <Button label={t('pregnancy.openExisting')} className="p-button-sm" onClick={openExistingPregnancy} />
                            </div>
                        }
                    />
                </div>
            )}
        </div>
    );

    const renderDatingStep = () => (
        <div className="grid">
            <div className="col-12 md:col-6 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.lmp')}</label>
                <Calendar
                    value={formData.lmp ? new Date(formData.lmp) : null}
                    onChange={(e) => setFormData({ ...formData, lmp: e.value?.toISOString().slice(0, 10) })}
                    dateFormat="dd/mm/yy"
                    className="w-full"
                    showIcon
                />
            </div>
            <div className="col-12 md:col-6">
                {eddPreview && (
                    <Message
                        severity="info"
                        className="w-full"
                        text={`${t('pregnancy.wizard.eddPreview')}: ${new Date(eddPreview.edd).toLocaleDateString('fr-FR')} (${eddPreview.gestationalAge})`}
                    />
                )}
                {eddPreviewError && <Message severity="warn" className="w-full" text={eddPreviewError} />}
            </div>
            <div className="col-12 md:col-6 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.eddOverride')}</label>
                <Calendar
                    value={formData.edd ? new Date(formData.edd) : null}
                    onChange={(e) => setFormData({ ...formData, edd: e.value?.toISOString().slice(0, 10) })}
                    dateFormat="dd/mm/yy"
                    className="w-full"
                    showIcon
                />
            </div>
            <div className="col-12 md:col-6 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.eddSource')}</label>
                <Dropdown
                    value={formData.eddSource || 'CLINICAL'}
                    options={[
                        { label: t('pregnancy.enums.eddSource.CLINICAL'), value: 'CLINICAL' },
                        { label: t('pregnancy.enums.eddSource.ULTRASOUND'), value: 'ULTRASOUND' },
                    ]}
                    onChange={(e) => setFormData({ ...formData, eddSource: e.value })}
                    className="w-full"
                    disabled={!formData.edd}
                />
            </div>
        </div>
    );

    const renderDetailsStep = () => (
        <div className="grid">
            <div className="col-6 md:col-3 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.gravida')}</label>
                <InputNumber value={formData.gravida ?? null} onValueChange={(e) => setFormData({ ...formData, gravida: e.value ?? undefined })} className="w-full" />
            </div>
            <div className="col-6 md:col-3 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.para')}</label>
                <InputNumber value={formData.para ?? null} onValueChange={(e) => setFormData({ ...formData, para: e.value ?? undefined })} className="w-full" />
            </div>
            <div className="col-6 md:col-3 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.abortions')}</label>
                <InputNumber value={formData.abortions ?? null} onValueChange={(e) => setFormData({ ...formData, abortions: e.value ?? undefined })} className="w-full" />
            </div>
            <div className="col-6 md:col-3 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.livingChildren')}</label>
                <InputNumber value={formData.livingChildren ?? null} onValueChange={(e) => setFormData({ ...formData, livingChildren: e.value ?? undefined })} className="w-full" />
            </div>

            <div className="col-6 md:col-3 field flex align-items-center gap-2 mt-3">
                <InputSwitch checked={!!formData.isMultiple} onChange={(e) => setFormData({ ...formData, isMultiple: e.value })} />
                <label className="font-medium">{t('pregnancy.wizard.isMultiple')}</label>
            </div>
            <div className="col-6 md:col-3 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.fetusCount')}</label>
                <InputNumber value={formData.fetusCount ?? null} onValueChange={(e) => setFormData({ ...formData, fetusCount: e.value ?? undefined })} className="w-full" min={1} disabled={!formData.isMultiple} />
            </div>

            <div className="col-6 md:col-3 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.bloodGroup')}</label>
                <Dropdown value={formData.bloodGroup || null} options={BLOOD_GROUP_OPTIONS} onChange={(e) => setFormData({ ...formData, bloodGroup: e.value })} className="w-full" showClear />
            </div>
            <div className="col-6 md:col-3 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.rhesus')}</label>
                <Dropdown value={formData.rhesus || null} options={RHESUS_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, rhesus: e.value })} className="w-full" showClear />
            </div>

            <div className="col-12 md:col-6 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.riskLevel')}</label>
                <Dropdown value={formData.riskLevel || 'LOW'} options={RISK_LEVEL_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))} onChange={(e) => setFormData({ ...formData, riskLevel: e.value })} className="w-full" />
            </div>
            <div className="col-12 md:col-6 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.riskFactors')}</label>
                <MultiSelect
                    value={formData.riskFactors || []}
                    options={RISK_FACTOR_OPTIONS.map((o) => ({ label: t(o.labelKey), value: o.value }))}
                    onChange={(e) => setFormData({ ...formData, riskFactors: e.value })}
                    className="w-full"
                    display="chip"
                />
            </div>

            <div className="col-6 md:col-3 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.prePregnancyWeight')}</label>
                <InputNumber value={formData.prePregnancyWeight ?? null} onValueChange={(e) => setFormData({ ...formData, prePregnancyWeight: e.value ?? undefined })} className="w-full" mode="decimal" minFractionDigits={1} />
            </div>
            <div className="col-6 md:col-3 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.height')}</label>
                <InputNumber value={formData.height ?? null} onValueChange={(e) => setFormData({ ...formData, height: e.value ?? undefined })} className="w-full" />
            </div>

            <div className="col-12 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.obstetricHistoryNotes')}</label>
                <textarea
                    value={formData.obstetricHistoryNotes || ''}
                    onChange={(e) => setFormData({ ...formData, obstetricHistoryNotes: e.target.value })}
                    className="w-full p-inputtextarea p-inputtext"
                    rows={3}
                />
            </div>
            <div className="col-12 field">
                <label className="block font-medium mb-2">{t('pregnancy.wizard.medicalHistoryNotes')}</label>
                <textarea
                    value={formData.medicalHistoryNotes || ''}
                    onChange={(e) => setFormData({ ...formData, medicalHistoryNotes: e.target.value })}
                    className="w-full p-inputtextarea p-inputtext"
                    rows={3}
                />
            </div>
        </div>
    );

    return (
        <div>
            <Toast ref={toast} />

            <div className="flex justify-content-between align-items-center mb-4">
                <h1 className="text-3xl font-bold m-0">{t('pregnancy.wizard.title')}</h1>
                <Button label={t('common.backToList')} icon="pi pi-arrow-left" className="p-button-text" onClick={() => navigate('/pregnancies')} />
            </div>

            <Card>
                <Steps model={stepItems} activeIndex={activeStep} readOnly className="mb-5" />

                {activeStep === 0 && renderPatientStep()}
                {activeStep === 1 && renderDatingStep()}
                {activeStep === 2 && renderDetailsStep()}

                <div className="flex justify-content-between mt-4">
                    <Button
                        label={t('common.previous')}
                        icon="pi pi-arrow-left"
                        className="p-button-text"
                        onClick={() => setActiveStep((s) => s - 1)}
                        disabled={activeStep === 0}
                    />
                    {activeStep < 2 ? (
                        <Button
                            label={t('common.next')}
                            icon="pi pi-arrow-right"
                            iconPos="right"
                            onClick={() => setActiveStep((s) => s + 1)}
                            disabled={!canGoNext()}
                        />
                    ) : (
                        <Button
                            label={t('pregnancy.wizard.submit')}
                            icon="pi pi-check"
                            loading={submitting}
                            onClick={handleSubmit}
                        />
                    )}
                </div>
            </Card>
        </div>
    );
};

export default PregnancyWizard;
