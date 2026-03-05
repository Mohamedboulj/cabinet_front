import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationService } from '../services/consultationService';
import { auditLogService } from '../services/auditLogService';
import { getApiErrorMessage } from '../utils/errorUtils';
import type { Consultation, AuditLog } from '../types';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import ConsultationDetailSkeleton from '../components/skeletons/ConsultationDetailSkeleton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ActivityHistory from '../components/ActivityHistory';

const ConsultationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadConsultation(parseInt(id));
      loadAuditLogs();
    }
  }, [id]);

  const loadConsultation = async (consultationId: number) => {
    setLoading(true);
    try {
      const response = await consultationService.getConsultation(consultationId);
      setConsultation(response.data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger la consultation',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const response = await auditLogService.getAuditLogs('Consultation', parseInt(id!));
      setAuditLogs(response.data);
    } catch {
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!consultation) return;
    try {
      await consultationService.completeConsultation(consultation.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Consultation terminée',
      });
      loadConsultation(consultation.id);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de terminer la consultation',
      });
    }
  };

  const handleCancel = () => {
    if (!consultation) return;
    confirmDialog({
      message: 'Êtes-vous sûr de vouloir annuler cette consultation ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await consultationService.cancelConsultation(consultation.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Succès',
            detail: 'Consultation annulée',
          });
          loadConsultation(consultation.id);
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Erreur',
            detail: "Impossible d'annuler la consultation",
          });
        }
      },
    });
  };

  const handleDelete = () => {
    if (!consultation) return;
    confirmDialog({
      message: `Êtes-vous sûr de vouloir supprimer la consultation #${consultation.id} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await consultationService.deleteConsultation(consultation.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Succès',
            detail: 'Consultation supprimée',
          });
          navigate('/consultations');
        } catch (error: any) {
          toast.current?.show({
            severity: 'error',
            summary: 'Erreur',
            detail: getApiErrorMessage(error, 'Impossible de supprimer la consultation'),
          });
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { label: string; severity: 'success' | 'warning' | 'danger' }> = {
      'IN_PROGRESS': { label: 'En cours', severity: 'warning' },
      'COMPLETED': { label: 'Terminée', severity: 'success' },
      'CANCELLED': { label: 'Annulée', severity: 'danger' },
    };
    const s = statusMap[status] || { label: status, severity: 'warning' };
    return <Tag value={s.label} severity={s.severity} />;
  };

  if (loading) {
    return <ConsultationDetailSkeleton />;
  }

  if (!consultation) {
    return (
      <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
        <i className="pi pi-exclamation-circle text-4xl text-orange-500 mb-3"></i>
        <h2>Consultation introuvable</h2>
        <Button label="Retour aux consultations" icon="pi pi-arrow-left" onClick={() => navigate('/consultations')} />
      </div>
    );
  }

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
            onClick={() => navigate('/consultations')}
          />
          <h1 className="text-3xl font-bold m-0">Consultation #{consultation.id}</h1>
          <div className="flex gap-2 mt-2">
            {getStatusTag(consultation.status)}
            {consultation.isPaid ? (
              <Tag icon="pi pi-check" value="Payée" severity="success" />
            ) : (
              <Tag icon="pi pi-times" value="Non payée" severity="danger" />
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {consultation.status === 'IN_PROGRESS' && (
            <>
              <Button
                label="Terminer"
                icon="pi pi-check-circle"
                className="p-button-success"
                onClick={handleComplete}
              />
              <Button
                label="Annuler"
                icon="pi pi-times-circle"
                className="p-button-secondary"
                onClick={handleCancel}
              />
            </>
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
          />
        </div>
      </div>

      {/* Patient & Doctor Info */}
      <div className="grid mb-4">
        <div className="col-12 md:col-6">
          <Card className="shadow-2" title="Patient">
            <div className="flex flex-column gap-2">
              <div><strong>Nom:</strong> {consultation.patient?.fullName || `${consultation.patient?.firstName} ${consultation.patient?.lastName}`}</div>
              <div><strong>Téléphone:</strong> {consultation.patient?.phone}</div>
            </div>
          </Card>
        </div>
        <div className="col-12 md:col-6">
          <Card className="shadow-2" title="Médecin">
            <div className="flex flex-column gap-2">
              <div><strong>Nom:</strong> {consultation.doctor?.fullName || `${consultation.doctor?.firstName} ${consultation.doctor?.lastName}`}</div>
              <div><strong>Date:</strong> {new Date(consultation.createdAt).toLocaleString('fr-FR')}</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <TabView>
        <TabPanel header="Consultation" leftIcon="pi pi-file-edit mr-2">
          <div className="grid">
            <div className="col-12 md:col-6">
              <Card className="shadow-2 mb-3" title="Motif">
                <p>{consultation.reason || '-'}</p>
              </Card>
              <Card className="shadow-2 mb-3" title="Anamnèse">
                <p>{consultation.anamnesis || '-'}</p>
              </Card>
              <Card className="shadow-2" title="Examen clinique">
                <p>{consultation.examination || '-'}</p>
              </Card>
            </div>
            <div className="col-12 md:col-6">
              <Card className="shadow-2 mb-3" title="Diagnostic">
                <p>{consultation.diagnosis || '-'}</p>
              </Card>
              <Card className="shadow-2 mb-3" title="Recommandations">
                <p>{consultation.recommendations || '-'}</p>
              </Card>
              {consultation.notes && (
                <Card className="shadow-2" title="Notes">
                  <p>{consultation.notes}</p>
                </Card>
              )}
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Signes vitaux" leftIcon="pi pi-heart mr-2">
          <Card className="shadow-2">
            <div className="grid">
              <div className="col-6 md:col-3">
                <div className="text-center p-3 surface-100 border-round">
                  <i className="pi pi-heart text-primary text-2xl mb-2"></i>
                  <div className="text-500 text-sm">Tension artérielle</div>
                  <div className="font-bold text-lg">{consultation.bloodPressure || '-'}</div>
                </div>
              </div>
              <div className="col-6 md:col-3">
                <div className="text-center p-3 surface-100 border-round">
                  <i className="pi pi-chart-line text-primary text-2xl mb-2"></i>
                  <div className="text-500 text-sm">Poids</div>
                  <div className="font-bold text-lg">{consultation.weight ? `${consultation.weight} kg` : '-'}</div>
                </div>
              </div>
              <div className="col-6 md:col-3">
                <div className="text-center p-3 surface-100 border-round">
                  <i className="pi pi-sun text-primary text-2xl mb-2"></i>
                  <div className="text-500 text-sm">Température</div>
                  <div className="font-bold text-lg">{consultation.temperature ? `${consultation.temperature}°C` : '-'}</div>
                </div>
              </div>
              <div className="col-6 md:col-3">
                <div className="text-center p-3 surface-100 border-round">
                  <i className="pi pi-clock text-primary text-2xl mb-2"></i>
                  <div className="text-500 text-sm">Fréquence cardiaque</div>
                  <div className="font-bold text-lg">{consultation.heartRate ? `${consultation.heartRate} bpm` : '-'}</div>
                </div>
              </div>
              <div className="col-6 md:col-3 mt-3">
                <div className="text-center p-3 surface-100 border-round">
                  <i className="pi pi-wave-pulse text-primary text-2xl mb-2"></i>
                  <div className="text-500 text-sm">Fréq. respiratoire</div>
                  <div className="font-bold text-lg">{consultation.respiratoryRate ? `${consultation.respiratoryRate}/min` : '-'}</div>
                </div>
              </div>
              <div className="col-6 md:col-3 mt-3">
                <div className="text-center p-3 surface-100 border-round">
                  <i className="pi pi-percentage text-primary text-2xl mb-2"></i>
                  <div className="text-500 text-sm">Saturation O₂</div>
                  <div className="font-bold text-lg">{consultation.oxygenSaturation ? `${consultation.oxygenSaturation}%` : '-'}</div>
                </div>
              </div>
            </div>
          </Card>
        </TabPanel>

        <TabPanel header="Ordonnances" leftIcon="pi pi-file mr-2">
          <Card className="shadow-2">
            <DataTable value={consultation.prescriptions || []} emptyMessage="Aucune ordonnance">
              <Column field="medicationName" header="Médicament" />
              <Column field="dosage" header="Dosage" />
              <Column field="frequency" header="Fréquence" />
              <Column field="duration" header="Durée" />
              <Column field="instructions" header="Instructions" />
              <Column
                body={() => (
                  <Button
                    icon="pi pi-print"
                    className="p-button-rounded p-button-secondary p-button-sm"
                    tooltip="Imprimer"
                  />
                )}
                header="Actions"
                style={{ width: '6rem' }}
              />
            </DataTable>
          </Card>
        </TabPanel>

        <TabPanel header="Historique des activités" leftIcon="pi pi-history mr-2">
          <ActivityHistory logs={auditLogs} loading={auditLoading} />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default ConsultationDetail;
