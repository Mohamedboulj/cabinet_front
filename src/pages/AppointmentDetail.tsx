import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import { auditLogService } from '../services/auditLogService';
import { patientService } from '../services/patientService';
import { userService } from '../services/userService';
import { getApiErrorMessage } from '../utils/errorUtils';
import type { Appointment, AuditLog, Patient, User } from '../types';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Skeleton } from 'primereact/skeleton';
import ActivityHistory from '../components/ActivityHistory';
import { Calendar as PrimeCalendar } from 'primereact/calendar';

const AppointmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [auditLoading, setAuditLoading] = useState(true);

    // Edit dialog state
    const [editVisible, setEditVisible] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [submitting, setSubmitting] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<User[]>([]);

    useEffect(() => {
        if (id) {
            loadAppointment(parseInt(id));
            loadAuditLogs();
        }
    }, [id]);

    const loadAppointment = async (appointmentId: number) => {
        setLoading(true);
        try {
            const response = await appointmentService.getAppointment(appointmentId);
            setAppointment(response.data);
        } catch {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger le rendez-vous',
            });
        } finally {
            setLoading(false);
        }
    };

    const loadAuditLogs = async () => {
        setAuditLoading(true);
        try {
            const response = await auditLogService.getAuditLogs('Appointment', parseInt(id!));
            setAuditLogs(response.data);
        } catch {
            setAuditLogs([]);
        } finally {
            setAuditLoading(false);
        }
    };

    const loadDropdowns = async () => {
        try {
            const [pRes, dRes] = await Promise.all([
                patientService.getPatients(),
                userService.getDoctors(),
            ]);
            setPatients(pRes.data);
            setDoctors(dRes.data);
        } catch {
            // silent
        }
    };

    const openEditDialog = () => {
        if (!appointment) return;
        loadDropdowns();
        setEditData({
            patientId: appointment.patient?.id,
            doctorId: appointment.doctor?.id,
            startAt: appointment.startAt ? new Date(appointment.startAt) : null,
            endAt: appointment.endAt ? new Date(appointment.endAt) : null,
            type: appointment.type,
            reason: appointment.reason || '',
            notes: appointment.notes || '',
            status: appointment.status,
        });
        setEditVisible(true);
    };

    const handleEditSubmit = async () => {
        if (!appointment) return;
        setSubmitting(true);
        try {
            await appointmentService.updateAppointment(appointment.id, editData);
            toast.current?.show({
                severity: 'success',
                summary: 'Succès',
                detail: 'Rendez-vous mis à jour',
            });
            setEditVisible(false);
            loadAppointment(appointment.id);
            loadAuditLogs();
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: getApiErrorMessage(error, 'Impossible de mettre à jour le rendez-vous'),
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirm = async () => {
        if (!appointment) return;
        try {
            await appointmentService.confirmAppointment(appointment.id);
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Rendez-vous confirmé' });
            loadAppointment(appointment.id);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: getApiErrorMessage(error) });
        }
    };

    const handleComplete = async () => {
        if (!appointment) return;
        try {
            await appointmentService.completeAppointment(appointment.id);
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Rendez-vous terminé' });
            loadAppointment(appointment.id);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: getApiErrorMessage(error) });
        }
    };

    const handleCancel = () => {
        if (!appointment) return;
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await appointmentService.cancelAppointment(appointment.id);
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Rendez-vous annulé' });
                    loadAppointment(appointment.id);
                } catch (error) {
                    toast.current?.show({ severity: 'error', summary: 'Erreur', detail: getApiErrorMessage(error) });
                }
            },
        });
    };

    const handleDelete = () => {
        if (!appointment) return;
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer ce rendez-vous ?',
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await appointmentService.deleteAppointment(appointment.id);
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Rendez-vous supprimé' });
                    navigate('/appointments');
                } catch (error) {
                    toast.current?.show({ severity: 'error', summary: 'Erreur', detail: getApiErrorMessage(error, 'Impossible de supprimer') });
                }
            },
        });
    };

    const getStatusTag = (status: string) => {
        const statusMap: Record<string, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' }> = {
            'SCHEDULED': { label: 'Planifié', severity: 'info' },
            'CONFIRMED': { label: 'Confirmé', severity: 'success' },
            'IN_PROGRESS': { label: 'En cours', severity: 'warning' },
            'COMPLETED': { label: 'Terminé', severity: 'success' },
            'CANCELLED': { label: 'Annulé', severity: 'danger' },
            'NO_SHOW': { label: 'Non présenté', severity: 'secondary' },
        };
        const s = statusMap[status] || { label: status, severity: 'info' };
        return <Tag value={s.label} severity={s.severity} />;
    };

    const getTypeLabel = (type: string) => {
        const map: Record<string, string> = {
            'CONSULTATION': 'Consultation',
            'FOLLOW_UP': 'Suivi',
            'EXAMINATION': 'Examen',
            'EMERGENCY': 'Urgence',
        };
        return map[type] || type;
    };

    // Loading skeleton
    if (loading) {
        return (
            <div>
                <div className="flex justify-content-between align-items-start mb-4">
                    <div>
                        <Skeleton width="5rem" height="1.5rem" className="mb-2" />
                        <Skeleton width="16rem" height="2rem" className="mb-2" />
                        <div className="flex gap-2 mt-2">
                            <Skeleton width="5rem" height="1.5rem" borderRadius="6px" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton width="7rem" height="2.5rem" borderRadius="6px" />
                        <Skeleton width="7rem" height="2.5rem" borderRadius="6px" />
                    </div>
                </div>
                <div className="grid mb-4">
                    {[0, 1].map((i) => (
                        <div key={i} className="col-12 md:col-6">
                            <Card className="shadow-2">
                                <Skeleton width="40%" height="1.2rem" className="mb-3" />
                                <Skeleton width="80%" height="1rem" className="mb-2" />
                                <Skeleton width="60%" height="1rem" />
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                <i className="pi pi-exclamation-circle text-4xl text-orange-500 mb-3"></i>
                <h2>Rendez-vous introuvable</h2>
                <Button label="Retour aux rendez-vous" icon="pi pi-arrow-left" onClick={() => navigate('/appointments')} />
            </div>
        );
    }

    const canConfirm = appointment.status === 'SCHEDULED';
    const canComplete = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(appointment.status);
    const canCancel = ['SCHEDULED', 'CONFIRMED'].includes(appointment.status);

    const editDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label="Annuler" icon="pi pi-times" className="p-button-text" onClick={() => setEditVisible(false)} />
            <Button label="Enregistrer" icon="pi pi-check" loading={submitting} onClick={handleEditSubmit} />
        </div>
    );

    const statusOptions = [
        { label: 'Planifié', value: 'SCHEDULED' },
        { label: 'Confirmé', value: 'CONFIRMED' },
        { label: 'En cours', value: 'IN_PROGRESS' },
        { label: 'Terminé', value: 'COMPLETED' },
        { label: 'Annulé', value: 'CANCELLED' },
        { label: 'Non présenté', value: 'NO_SHOW' },
    ];

    const typeOptions = [
        { label: 'Consultation', value: 'CONSULTATION' },
        { label: 'Suivi', value: 'FOLLOW_UP' },
        { label: 'Examen', value: 'EXAMINATION' },
        { label: 'Urgence', value: 'EMERGENCY' },
    ];

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
                        onClick={() => navigate('/appointments')}
                    />
                    <h1 className="text-3xl font-bold m-0">Rendez-vous #{appointment.id}</h1>
                    <div className="flex gap-2 mt-2">
                        {getStatusTag(appointment.status)}
                        <Tag value={getTypeLabel(appointment.type)} className="bg-blue-100 text-blue-700" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="Modifier" icon="pi pi-pencil" className="p-button-warning" onClick={openEditDialog} />
                    {canConfirm && (
                        <Button label="Confirmer" icon="pi pi-check" className="p-button-success" onClick={handleConfirm} />
                    )}
                    {canComplete && (
                        <Button label="Terminer" icon="pi pi-check-circle" className="p-button-info" onClick={handleComplete} />
                    )}
                    {canCancel && (
                        <Button label="Annuler" icon="pi pi-times-circle" className="p-button-secondary" onClick={handleCancel} />
                    )}
                    <Button label="Supprimer" icon="pi pi-trash" className="p-button-danger" onClick={handleDelete} />
                </div>
            </div>

            {/* Patient & Doctor Info */}
            <div className="grid mb-4">
                <div className="col-12 md:col-6">
                    <Card className="shadow-2" title="Patient">
                        <div className="flex flex-column gap-2">
                            <div><strong>Nom:</strong> {appointment.patient?.fullName || `${appointment.patient?.firstName} ${appointment.patient?.lastName}`}</div>
                            <div><strong>Téléphone:</strong> {appointment.patient?.phone}</div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-6">
                    <Card className="shadow-2" title="Médecin">
                        <div className="flex flex-column gap-2">
                            <div><strong>Nom:</strong> {appointment.doctor?.fullName || `${appointment.doctor?.firstName} ${appointment.doctor?.lastName}`}</div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Tabs */}
            <TabView>
                <TabPanel header="Informations" leftIcon="pi pi-info-circle mr-2">
                    <Card className="shadow-2">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <h3 className="text-lg font-semibold mb-3">Détails du rendez-vous</h3>
                                <div className="flex flex-column gap-3">
                                    <div><strong>Date de début:</strong> {new Date(appointment.startAt).toLocaleString('fr-FR')}</div>
                                    <div><strong>Date de fin:</strong> {new Date(appointment.endAt).toLocaleString('fr-FR')}</div>
                                    <div><strong>Type:</strong> {getTypeLabel(appointment.type)}</div>
                                    <div><strong>Motif:</strong> {appointment.reason || '-'}</div>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <h3 className="text-lg font-semibold mb-3">Informations complémentaires</h3>
                                <div className="flex flex-column gap-3">
                                    <div><strong>Notes:</strong> {appointment.notes || '-'}</div>
                                    <div><strong>Récurrent:</strong> {appointment.isRecurring ? 'Oui' : 'Non'}</div>
                                    {appointment.isRecurring && appointment.recurrencePattern && (
                                        <div><strong>Pattern de récurrence:</strong> {appointment.recurrencePattern}</div>
                                    )}
                                    <div><strong>Créé le:</strong> {new Date(appointment.createdAt).toLocaleString('fr-FR')}</div>
                                    <div><strong>Mis à jour:</strong> {new Date(appointment.updatedAt).toLocaleString('fr-FR')}</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabPanel>

                <TabPanel header="Historique des activités" leftIcon="pi pi-history mr-2">
                    <ActivityHistory logs={auditLogs} loading={auditLoading} />
                </TabPanel>
            </TabView>

            {/* Edit Dialog */}
            <Dialog
                visible={editVisible}
                onHide={() => setEditVisible(false)}
                header="Modifier le rendez-vous"
                className="w-11/12 md:w-8 lg:w-6"
                footer={editDialogFooter}
            >
                <div className="grid">
                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">Patient *</label>
                        <Dropdown
                            value={editData.patientId}
                            options={patients.map((p) => ({ label: `${p.firstName} ${p.lastName}`, value: p.id }))}
                            onChange={(e) => setEditData({ ...editData, patientId: e.value })}
                            placeholder="Sélectionner un patient"
                            className="w-full"
                            filter
                            filterPlaceholder="Rechercher..."
                            disabled={true}
                        />
                    </div>
                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">Médecin *</label>
                        <Dropdown
                            value={editData.doctorId}
                            options={doctors.map((d) => ({ label: `${d.firstName} ${d.lastName}`, value: d.id }))}
                            onChange={(e) => setEditData({ ...editData, doctorId: e.value })}
                            placeholder="Sélectionner un médecin"
                            className="w-full"
                            filter
                            filterPlaceholder="Rechercher..."
                        />
                    </div>
                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">Date de début *</label>
                        <PrimeCalendar
                            value={editData.startAt}
                            onChange={(e) => setEditData({ ...editData, startAt: e.value as Date })}
                            className="w-full"
                            showTime
                            hourFormat="24"
                            placeholder="Date et heure"
                        />
                    </div>
                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">Date de fin *</label>
                        <PrimeCalendar
                            value={editData.endAt}
                            onChange={(e) => setEditData({ ...editData, endAt: e.value as Date })}
                            className="w-full"
                            showTime
                            hourFormat="24"
                            placeholder="Date et heure"
                        />
                    </div>
                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">Type</label>
                        <Dropdown
                            value={editData.type}
                            options={typeOptions}
                            onChange={(e) => setEditData({ ...editData, type: e.value })}
                            placeholder="Sélectionner"
                            className="w-full"
                        />
                    </div>
                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">Statut</label>
                        <Dropdown
                            value={editData.status}
                            options={statusOptions}
                            onChange={(e) => setEditData({ ...editData, status: e.value })}
                            placeholder="Sélectionner"
                            className="w-full"
                        />
                    </div>
                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">Motif</label>
                        <InputText
                            value={editData.reason || ''}
                            onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
                            className="w-full"
                        />
                    </div>
                    <div className="col-12 md:col-6 field">
                        <label className="block font-medium mb-2">Notes</label>
                        <InputTextarea
                            value={editData.notes || ''}
                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                            className="w-full"
                            rows={3}
                            autoResize
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default AppointmentDetail;
