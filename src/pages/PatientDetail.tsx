import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { auditLogService } from '../services/auditLogService';
import type { Patient, Consultation, Appointment, AuditLog } from '../types';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import PatientDetailSkeleton from '../components/skeletons/PatientDetailSkeleton';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import ActivityHistory from '../components/ActivityHistory';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPatient(parseInt(id));
      loadAuditLogs();
    }
  }, [id]);

  const loadPatient = async (patientId: number) => {
    try {
      const response = await patientService.getPatient(patientId);
      setPatient(response.data);
      // Load consultations and appointments from the response
      if (response.data.consultations) {
        setConsultations(response.data.consultations);
      }
      if (response.data.appointments) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('patientDetail.loadError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const response = await auditLogService.getAuditLogs('Patient', parseInt(id!));
      setAuditLogs(response.data);
    } catch {
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  };

  if (loading) {
    return <PatientDetailSkeleton />;
  }

  if (!patient) {
    return (
      <div className="text-center py-8">
        <i className="pi pi-exclamation-circle text-6xl text-500 mb-4"></i>
        <h2 className="text-2xl font-semibold">{t('patientDetail.notFound')}</h2>
        <Button
          label={t('common.backToList')}
          icon="pi pi-arrow-left"
          className="mt-4"
          onClick={() => navigate('/patients')}
        />
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex justify-content-between align-items-start mb-4">
        <div>
          <Button
            label={t('common.back')}
            icon="pi pi-arrow-left"
            className="p-button-text mb-2"
            onClick={() => navigate('/patients')}
          />
          <h1 className="text-3xl font-bold m-0">{patient.fullName}</h1>
          <div className="flex gap-2 mt-2">
            {patient.gender && (
              <Tag
                icon={patient.gender === 'M' ? 'pi pi-male' : 'pi pi-female'}
                value={patient.gender === 'M' ? t('patients.male') : t('patients.female')}
                className={patient.gender === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}
              />
            )}
            {patient.bloodType && (
              <Tag icon="pi pi-tint" value={t('patientDetail.bloodGroup', { type: patient.bloodType })} className="bg-red-100 text-red-700" />
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            label={t('patientDetail.newAppointment')}
            icon="pi pi-calendar-plus"
            className="p-button-info"
            onClick={() => navigate('/calendar', { state: { patientId: patient.id } })}
          />
          <Button
            label={t('patientDetail.newConsultation')}
            icon="pi pi-file-edit"
            className="p-button-success"
            onClick={() => navigate('/consultations', { state: { patientId: patient.id } })}
          />
          <Button
            label={t('common.edit')}
            icon="pi pi-pencil"
            className="p-button-warning"
            onClick={() => navigate('/patients', { state: { editId: patient.id } })}
          />
        </div>
      </div>

      {/* Patient Info Cards */}
      <div className="grid mb-4">
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="shadow-2">
            <div className="flex align-items-center gap-3">
              <i className="pi pi-phone text-primary text-2xl"></i>
              <div>
                <div className="text-500 text-sm">{t('patientDetail.phone')}</div>
                <div className="font-medium">{patient.phone}</div>
              </div>
            </div>
          </Card>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="shadow-2">
            <div className="flex align-items-center gap-3">
              <i className="pi pi-id-card text-primary text-2xl"></i>
              <div>
                <div className="text-500 text-sm">CIN</div>
                <div className="font-medium">{patient.cin || '-'}</div>
              </div>
            </div>
          </Card>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="shadow-2">
            <div className="flex align-items-center gap-3">
              <i className="pi pi-envelope text-primary text-2xl"></i>
              <div>
                <div className="text-500 text-sm">{t('patientDetail.email')}</div>
                <div className="font-medium">{patient.email || '-'}</div>
              </div>
            </div>
          </Card>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="shadow-2">
            <div className="flex align-items-center gap-3">
              <i className="pi pi-calendar text-primary text-2xl"></i>
              <div>
                <div className="text-500 text-sm">{t('patientDetail.ageBirthDate')}</div>
                <div className="font-medium">
                  {patient.age ? `${patient.age} ${t('patients.years')}` : '-'}
                  {patient.birthDate && ` ${new Date(patient.birthDate).toLocaleDateString('fr-FR')}`}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <TabView>
        <TabPanel header={t('patientDetail.tabs.info')} leftIcon="pi pi-user mr-2">
          <Card className="shadow-2">
            <div className="grid">
              <div className="col-12 md:col-6">
                <h3 className="text-lg font-semibold mb-3">{t('patientDetail.info.contactDetails')}</h3>
                <div className="flex flex-column gap-2">
                  <div><strong>{t('patientDetail.info.address')}:</strong> {patient.address || '-'}</div>
                  <div><strong>{t('patientDetail.info.city')}:</strong> {patient.city || '-'}</div>
                </div>
              </div>
              <div className="col-12 md:col-6">
                <h3 className="text-lg font-semibold mb-3">{t('patientDetail.info.insurance')}</h3>
                <div className="flex flex-column gap-2">
                  <div><strong>{t('patientDetail.info.insuranceProvider')}:</strong> {patient.insuranceProvider || '-'}</div>
                  <div><strong>{t('patientDetail.info.insuranceNumber')}:</strong> {patient.insuranceNumber || '-'}</div>
                </div>
              </div>
              <div className="col-12 md:col-6">
                <h3 className="text-lg font-semibold mb-3">{t('patientDetail.info.emergencyContact')}</h3>
                <div className="flex flex-column gap-2">
                  <div><strong>{t('patientDetail.info.emergencyName')}:</strong> {patient.emergencyContactName || '-'}</div>
                  <div><strong>{t('patientDetail.info.emergencyPhone')}:</strong> {patient.emergencyContactPhone || '-'}</div>
                </div>
              </div>
            </div>
          </Card>
        </TabPanel>

        <TabPanel header={t('patientDetail.tabs.history')} leftIcon="pi pi-heart mr-2">
          <Card className="shadow-2">
            <div className="grid">
              <div className="col-12 md:col-6">
                <h3 className="text-lg font-semibold mb-3">{t('patientDetail.history.medicalHistory')}</h3>
                <p className="surface-100 p-3 border-round">
                  {patient.medicalHistory || t('patientDetail.history.noMedicalHistory')}
                </p>
              </div>
              <div className="col-12 md:col-6">
                <h3 className="text-lg font-semibold mb-3">{t('patientDetail.history.allergies')}</h3>
                <p className="surface-100 p-3 border-round">
                  {patient.allergies || t('patientDetail.history.noAllergies')}
                </p>
              </div>
              <div className="col-12">
                <h3 className="text-lg font-semibold mb-3">{t('patientDetail.history.chronicConditions')}</h3>
                <p className="surface-100 p-3 border-round">
                  {patient.chronicConditions || t('patientDetail.history.noChronicConditions')}
                </p>
              </div>
            </div>
          </Card>
        </TabPanel>

        <TabPanel header={t('patientDetail.tabs.consultations', { count: consultations.length })} leftIcon="pi pi-file-edit mr-2">
          <Card className="shadow-2">
            <DataTable
              value={consultations}
              paginator
              rows={5}
              emptyMessage={t('patientDetail.consultationTable.noConsultations')}
            >
              <Column
                field="createdAt"
                header={t('patientDetail.consultationTable.date')}
                body={(row) => new Date(row.createdAt).toLocaleDateString('fr-FR')}
              />
              <Column field="reason" header={t('patientDetail.consultationTable.reason')} />
              <Column field="diagnosis" header={t('patientDetail.consultationTable.diagnosis')} />
              <Column
                field="status"
                header={t('patientDetail.consultationTable.status')}
                body={(row) => (
                  <Tag
                    value={row.status === 'COMPLETED' ? t('status.completedF') : t('status.inProgress')}
                    severity={row.status === 'COMPLETED' ? 'success' : 'warning'}
                  />
                )}
              />
              <Column
                body={(row) => (
                  <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => navigate(`/consultations/${row.id}`)}
                  />
                )}
              />
            </DataTable>
          </Card>
        </TabPanel>

        <TabPanel header={t('patientDetail.tabs.appointments', { count: appointments.length })} leftIcon="pi pi-calendar mr-2">
          <Card className="shadow-2">
            <DataTable
              value={appointments}
              paginator
              rows={5}
              emptyMessage={t('patientDetail.appointmentTable.noAppointments')}
            >
              <Column
                field="startAt"
                header={t('patientDetail.appointmentTable.date')}
                body={(row) => new Date(row.startAt).toLocaleString('fr-FR')}
              />
              <Column field="reason" header={t('patientDetail.appointmentTable.reason')} />
              <Column
                field="status"
                header={t('patientDetail.appointmentTable.status')}
                body={(row) => {
                  const statusMap: Record<string, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' }> = {
                    'SCHEDULED': { label: t('status.scheduled'), severity: 'info' },
                    'CONFIRMED': { label: t('status.confirmed'), severity: 'success' },
                    'COMPLETED': { label: t('status.completed'), severity: 'success' },
                    'CANCELLED': { label: t('status.cancelled'), severity: 'danger' },
                  };
                  const status = statusMap[row.status] || { label: row.status, severity: 'info' };
                  return <Tag value={status.label} severity={status.severity} />;
                }}
              />
            </DataTable>
          </Card>
        </TabPanel>

        <TabPanel header={t('patientDetail.tabs.activityHistory')} leftIcon="pi pi-history mr-2">
          <ActivityHistory logs={auditLogs} loading={auditLoading} />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default PatientDetail;
