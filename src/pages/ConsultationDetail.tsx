import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const ConsultationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock consultation data
  const consultation = {
    id: parseInt(id || '1'),
    patient: { id: 1, firstName: 'Jean', lastName: 'Dupont', fullName: 'Jean Dupont', phone: '0612345678', createdAt: '', updatedAt: '' },
    doctor: { id: 1, email: 'doc@example.com', firstName: 'Dr.', lastName: 'Martin', fullName: 'Dr. Martin', roles: ['ROLE_MEDECIN'], isActive: true, createdAt: '', updatedAt: '' },
    reason: 'Consultation de routine',
    anamnesis: 'Patient se plaint de maux de tête fréquents et de fatigue.',
    examination: 'TA: 140/90, Pouls: 78/min, Temp: 36.8°C',
    diagnosis: 'Hypertension artérielle légère',
    recommendations: 'Surveillance de la tension artérielle. Régime alimentaire pauvre en sel.',
    bloodPressure: '140/90',
    weight: '75.5',
    temperature: '36.8',
    heartRate: 78,
    status: 'COMPLETED',
    isPaid: true,
    createdAt: '2024-01-15T10:00:00Z',
    prescriptions: [
      {
        id: 1,
        medicationName: 'Amlodipine',
        dosage: '5mg',
        frequency: '1 fois par jour',
        duration: '30 jours',
        instructions: 'Prendre le matin',
      },
    ],
  };

  return (
    <div>
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
            <Tag 
              value={consultation.status === 'COMPLETED' ? 'Terminée' : 'En cours'}
              severity={consultation.status === 'COMPLETED' ? 'success' : 'warning'}
            />
            {consultation.isPaid ? (
              <Tag icon="pi pi-check" value="Payée" severity="success" />
            ) : (
              <Tag icon="pi pi-times" value="Non payée" severity="danger" />
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            label="Modifier"
            icon="pi pi-pencil"
            className="p-button-warning"
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
              <div><strong>Nom:</strong> {consultation.patient.fullName}</div>
              <div><strong>Téléphone:</strong> {consultation.patient.phone}</div>
            </div>
          </Card>
        </div>
        <div className="col-12 md:col-6">
          <Card className="shadow-2" title="Médecin">
            <div className="flex flex-column gap-2">
              <div><strong>Nom:</strong> {consultation.doctor.fullName}</div>
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
                <p>{consultation.reason}</p>
              </Card>
              <Card className="shadow-2 mb-3" title="Anamnèse">
                <p>{consultation.anamnesis}</p>
              </Card>
              <Card className="shadow-2" title="Examen clinique">
                <p>{consultation.examination}</p>
              </Card>
            </div>
            <div className="col-12 md:col-6">
              <Card className="shadow-2 mb-3" title="Diagnostic">
                <p>{consultation.diagnosis}</p>
              </Card>
              <Card className="shadow-2" title="Recommandations">
                <p>{consultation.recommendations}</p>
              </Card>
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
                  <div className="font-bold text-lg">{consultation.bloodPressure}</div>
                </div>
              </div>
              <div className="col-6 md:col-3">
                <div className="text-center p-3 surface-100 border-round">
                  <i className="pi pi-chart-line text-primary text-2xl mb-2"></i>
                  <div className="text-500 text-sm">Poids</div>
                  <div className="font-bold text-lg">{consultation.weight} kg</div>
                </div>
              </div>
              <div className="col-6 md:col-3">
                <div className="text-center p-3 surface-100 border-round">
                  <i className="pi pi-sun text-primary text-2xl mb-2"></i>
                  <div className="text-500 text-sm">Température</div>
                  <div className="font-bold text-lg">{consultation.temperature}°C</div>
                </div>
              </div>
              <div className="col-6 md:col-3">
                <div className="text-center p-3 surface-100 border-round">
                  <i className="pi pi-clock text-primary text-2xl mb-2"></i>
                  <div className="text-500 text-sm">Fréquence cardiaque</div>
                  <div className="font-bold text-lg">{consultation.heartRate} bpm</div>
                </div>
              </div>
            </div>
          </Card>
        </TabPanel>

        <TabPanel header="Ordonnances" leftIcon="pi pi-file mr-2">
          <Card className="shadow-2">
            <DataTable value={consultation.prescriptions} emptyMessage="Aucune ordonnance">
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
      </TabView>
    </div>
  );
};

export default ConsultationDetail;
