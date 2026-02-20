import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { appointmentService } from '../services/appointmentService';
import { patientService } from '../services/patientService';
import { userService } from '../services/userService';
import { getApiErrorMessage } from '../utils/errorUtils';
import type { Appointment, Patient, User } from '../types';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar as PrimeCalendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { AutoComplete } from 'primereact/autocomplete';

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [formData, setFormData] = useState<{
    patientId?: number;
    doctorId?: number;
    startAt?: Date;
    endAt?: Date;
    reason?: string;
    notes?: string;
    type?: string;
  }>({});

  useEffect(() => {
    loadEvents();
    loadDoctors();
  }, []);

  const loadEvents = async () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    const start = calendarApi.view.activeStart;
    const end = calendarApi.view.activeEnd;

    try {
      const data = await appointmentService.getCalendarEvents({
        start: start.toISOString(),
        end: end.toISOString(),
      });
      setEvents(data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les rendez-vous',
      });
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await userService.getUsers();
      const doctorUsers = response.data
        .filter(user => user.roles.includes('ROLE_MEDECIN'))
        .map(user => ({ ...user, fullName: `${user.firstName} ${user.lastName}` }));
      setDoctors(doctorUsers);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les médecins',
      });
    }
  };

  const searchPatients = async (event: { query: string }) => {
    if (event.query.length < 2) {
      setPatients([]);
      return;
    }
    try {
      const response = await patientService.searchPatients(event.query);
      const patientsWithFullName = response.data.map(p => ({
        ...p,
        fullName: `${p.firstName} ${p.lastName}`
      }));
      setPatients(patientsWithFullName);
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start);
    setEditingAppointment(null);
    setFormData({
      startAt: selectInfo.start,
      endAt: selectInfo.end,
      type: 'CONSULTATION',
    });
    setDialogVisible(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const appointmentId = clickInfo.event.id;
    navigate(`/appointments?id=${appointmentId}`);
  };

  const handleSubmit = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.startAt || !formData.endAt) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs obligatoires',
      });
      return;
    }

    setLoading(true);
    try {
      if (editingAppointment) {
        await appointmentService.updateAppointment(editingAppointment.id, formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Rendez-vous mis à jour',
        });
      } else {
        await appointmentService.createAppointment(formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Rendez-vous créé',
        });
      }
      setDialogVisible(false);
      loadEvents();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const dialogFooter = (
    <div className="flex justify-content-between">
      <div>
        {editingAppointment && (
          <Button
            label="Supprimer"
            icon="pi pi-trash"
            className="p-button-danger"
            onClick={() => { }}
          />
        )}
      </div>
      <div className="flex gap-2">
        <Button
          label="Annuler"
          icon="pi pi-times"
          className="p-button-text"
          onClick={() => setDialogVisible(false)}
        />
        <Button
          label={editingAppointment ? 'Modifier' : 'Créer'}
          icon="pi pi-check"
          loading={loading}
          onClick={handleSubmit}
        />
      </div>
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold m-0">Calendrier des Rendez-vous</h1>
        <div className="flex gap-2">
          <Button
            label="Aujourd'hui"
            icon="pi pi-calendar"
            className="p-button-secondary"
            onClick={() => calendarRef.current?.getApi().today()}
          />
          <Button
            label="Nouveau RDV"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => {
              setEditingAppointment(null);
              setFormData({ type: 'CONSULTATION' });
              setDialogVisible(true);
            }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex align-items-center gap-2">
          <div className="w-3 h-3 border-circle" style={{ backgroundColor: '#3498db' }}></div>
          <span className="text-sm">Planifié</span>
        </div>
        <div className="flex align-items-center gap-2">
          <div className="w-3 h-3 border-circle" style={{ backgroundColor: '#2ecc71' }}></div>
          <span className="text-sm">Confirmé</span>
        </div>
        <div className="flex align-items-center gap-2">
          <div className="w-3 h-3 border-circle" style={{ backgroundColor: '#f39c12' }}></div>
          <span className="text-sm">En cours</span>
        </div>
        <div className="flex align-items-center gap-2">
          <div className="w-3 h-3 border-circle" style={{ backgroundColor: '#27ae60' }}></div>
          <span className="text-sm">Terminé</span>
        </div>
        <div className="flex align-items-center gap-2">
          <div className="w-3 h-3 border-circle" style={{ backgroundColor: '#e74c3c' }}></div>
          <span className="text-sm">Annulé</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="card shadow-2">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialView="timeGridWeek"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          locale="fr"
          buttonText={{
            today: "Aujourd'hui",
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
          }}
          allDayText="Toute la journée"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          slotDuration="00:30:00"
          validRange={{
            start: new Date().toISOString().split('T')[0] // Sets min date to today
          }}
        />
      </div>

      {/* Appointment Dialog */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header={editingAppointment ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
        className="w-11/12 md:w-6 lg:w-8"
        footer={dialogFooter}
      >
        <div className="flex flex-column gap-3">
          <div className="grid">
            <div className="field col-12 md:col-6 field">
              <label className="block font-medium mb-2">Patient *</label>
              <AutoComplete
                  value={selectedPatient}
                  suggestions={patients}
                  completeMethod={searchPatients}
                  field="fullName"
                  onChange={(e) => {
                    setSelectedPatient(e.value);
                    setFormData({ ...formData, patientId: e.value?.id });
                  }}
                  placeholder="Rechercher un patient..."
                  className="w-full"
                  inputClassName="w-full"
              />
            </div>

            <div className="field col-12 md:col-6 field">
              <label className="block font-medium mb-2">Médecin *</label>
              <Dropdown
                  value={formData.doctorId}
                  options={doctors}
                  optionLabel="fullName"
                  optionValue="id"
                  onChange={(e) => setFormData({ ...formData, doctorId: e.value })}
                  placeholder="Sélectionner un médecin"
                  className="w-full"
              />
            </div>
          </div>
          <div className="grid">
            <div className="col-6 field">
              <label className="block font-medium mb-2">Début *</label>
              <PrimeCalendar
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.value || undefined })}
                showTime
                hourFormat="24"
                className="w-full"
                placeholder="Date et heure"
                minDate={new Date()}
              />
            </div>
            <div className="col-6 field">
              <label className="block font-medium mb-2">Fin *</label>
              <PrimeCalendar
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.value || undefined })}
                showTime
                hourFormat="24"
                className="w-full"
                placeholder="Date et heure"
                minDate={new Date()}
              />
            </div>
          </div>

          <div className="field">
            <label className="block font-medium mb-2">Type</label>
            <Dropdown
              value={formData.type}
              options={[
                { label: 'Consultation', value: 'CONSULTATION' },
                { label: 'Suivi', value: 'FOLLOW_UP' },
                { label: 'Examen', value: 'EXAMINATION' },
                { label: 'Urgence', value: 'EMERGENCY' },
              ]}
              onChange={(e) => setFormData({ ...formData, type: e.value })}
              placeholder="Sélectionner le type"
              className="w-full"
            />
          </div>

          <div className="field">
            <label className="block font-medium mb-2">Motif</label>
            <InputText
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full"
              placeholder="Motif du rendez-vous"
            />
          </div>

          <div className="field">
            <label className="block font-medium mb-2">Notes</label>
            <InputTextarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full"
              rows={3}
              placeholder="Notes additionnelles"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Calendar;
