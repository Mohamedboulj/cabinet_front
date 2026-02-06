import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import type { Patient, Consultation, Appointment } from '../types';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPatient(parseInt(id));
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
        summary: 'Erreur',
        detail: 'Impossible de charger les détails du patient',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center h-20rem">
        <ProgressSpinner />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-8">
        <i className="pi pi-exclamation-circle text-6xl text-500 mb-4"></i>
        <h2 className="text-2xl font-semibold">Patient non trouvé</h2>
        <Button 
          label="Retour à la liste" 
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
            label="Retour"
            icon="pi pi-arrow-left"
            className="p-button-text mb-2"
            onClick={() => navigate('/patients')}
          />
          <h1 className="text-3xl font-bold m-0">{patient.fullName}</h1>
          <div className="flex gap-2 mt-2">
            {patient.gender && (
              <Tag 
                icon={patient.gender === 'M' ? 'pi pi-male' : 'pi pi-female'}
                value={patient.gender === 'M' ? 'Homme' : 'Femme'}
                className={patient.gender === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}
              />
            )}
            {patient.bloodType && (
              <Tag icon="pi pi-tint" value={`Groupe: ${patient.bloodType}`} className="bg-red-100 text-red-700" />
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            label="Nouveau RDV"
            icon="pi pi-calendar-plus"
            className="p-button-info"
            onClick={() => navigate('/calendar', { state: { patientId: patient.id } })}
          />
          <Button
            label="Nouvelle consultation"
            icon="pi pi-file-edit"
            className="p-button-success"
            onClick={() => navigate('/consultations', { state: { patientId: patient.id } })}
          />
          <Button
            label="Modifier"
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
                <div className="text-500 text-sm">Téléphone</div>
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
                <div className="text-500 text-sm">Email</div>
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
                <div className="text-500 text-sm">Âge / Date de naissance</div>
                <div className="font-medium">
                  {patient.age ? `${patient.age} ans` : '-'} 
                  {patient.birthDate && ` (${new Date(patient.birthDate).toLocaleDateString('fr-FR')})`}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <TabView>
        <TabPanel header="Informations" leftIcon="pi pi-user mr-2">
          <Card className="shadow-2">
            <div className="grid">
              <div className="col-12 md:col-6">
                <h3 className="text-lg font-semibold mb-3">Coordonnées</h3>
                <div className="flex flex-column gap-2">
                  <div><strong>Adresse:</strong> {patient.address || '-'}</div>
                  <div><strong>Ville:</strong> {patient.city || '-'}</div>
                </div>
              </div>
              <div className="col-12 md:col-6">
                <h3 className="text-lg font-semibold mb-3">Assurance</h3>
                <div className="flex flex-column gap-2">
                  <div><strong>Organisme:</strong> {patient.insuranceProvider || '-'}</div>
                  <div><strong>Numéro:</strong> {patient.insuranceNumber || '-'}</div>
                </div>
              </div>
              <div className="col-12 md:col-6">
                <h3 className="text-lg font-semibold mb-3">Contact d'urgence</h3>
                <div className="flex flex-column gap-2">
                  <div><strong>Nom:</strong> {patient.emergencyContactName || '-'}</div>
                  <div><strong>Téléphone:</strong> {patient.emergencyContactPhone || '-'}</div>
                </div>
              </div>
            </div>
          </Card>
        </TabPanel>

        <TabPanel header="Antécédents" leftIcon="pi pi-heart mr-2">
          <Card className="shadow-2">
            <div className="grid">
              <div className="col-12 md:col-6">
                <h3 className="text-lg font-semibold mb-3">Antécédents médicaux</h3>
                <p className="surface-100 p-3 border-round">
                  {patient.medicalHistory || 'Aucun antécédent médical enregistré'}
                </p>
              </div>
              <div className="col-12 md:col-6">
                <h3 className="text-lg font-semibold mb-3">Allergies</h3>
                <p className="surface-100 p-3 border-round">
                  {patient.allergies || 'Aucune allergie connue'}
                </p>
              </div>
              <div className="col-12">
                <h3 className="text-lg font-semibold mb-3">Maladies chroniques</h3>
                <p className="surface-100 p-3 border-round">
                  {patient.chronicConditions || 'Aucune maladie chronique connue'}
                </p>
              </div>
            </div>
          </Card>
        </TabPanel>

        <TabPanel header={`Consultations (${consultations.length})`} leftIcon="pi pi-file-edit mr-2">
          <Card className="shadow-2">
            <DataTable
              value={consultations}
              paginator
              rows={5}
              emptyMessage="Aucune consultation"
            >
              <Column 
                field="createdAt" 
                header="Date" 
                body={(row) => new Date(row.createdAt).toLocaleDateString('fr-FR')}
              />
              <Column field="reason" header="Motif" />
              <Column field="diagnosis" header="Diagnostic" />
              <Column 
                field="status" 
                header="Statut"
                body={(row) => (
                  <Tag 
                    value={row.status === 'COMPLETED' ? 'Terminée' : 'En cours'}
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

        <TabPanel header={`Rendez-vous (${appointments.length})`} leftIcon="pi pi-calendar mr-2">
          <Card className="shadow-2">
            <DataTable
              value={appointments}
              paginator
              rows={5}
              emptyMessage="Aucun rendez-vous"
            >
              <Column 
                field="startAt" 
                header="Date" 
                body={(row) => new Date(row.startAt).toLocaleString('fr-FR')}
              />
              <Column field="reason" header="Motif" />
              <Column 
                field="status" 
                header="Statut"
                body={(row) => {
                  const statusMap: Record<string, { label: string; severity: 'success' | 'info' | 'warning' | 'danger' }> = {
                    'SCHEDULED': { label: 'Planifié', severity: 'info' },
                    'CONFIRMED': { label: 'Confirmé', severity: 'success' },
                    'COMPLETED': { label: 'Terminé', severity: 'success' },
                    'CANCELLED': { label: 'Annulé', severity: 'danger' },
                  };
                  const status = statusMap[row.status] || { label: row.status, severity: 'info' };
                  return <Tag value={status.label} severity={status.severity} />;
                }}
              />
            </DataTable>
          </Card>
        </TabPanel>
      </TabView>
    </div>
  );
};

export default PatientDetail;
