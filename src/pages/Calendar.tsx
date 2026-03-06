import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { appointmentService } from '../services/appointmentService';
import { holidayService } from '../services/holidayService';
import { patientService } from '../services/patientService';
import { userService } from '../services/userService';
import { getApiErrorMessage } from '../utils/errorUtils';
import type { Appointment, Patient, User, Holiday } from '../types';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar as PrimeCalendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { AutoComplete } from 'primereact/autocomplete';
import { useTranslation } from 'react-i18next';


const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [, setSelectedDate] = useState<Date | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showHolidays, setShowHolidays] = useState(true);

  const STATUS_CONFIG: { key: string; label: string; color: string }[] = useMemo(() => [
    { key: 'SCHEDULED', label: t('status.scheduled'), color: '#3498db' },
    { key: 'CONFIRMED', label: t('status.confirmed'), color: '#2ecc71' },
    { key: 'IN_PROGRESS', label: t('status.inProgress'), color: '#f39c12' },
    { key: 'COMPLETED', label: t('status.completed'), color: '#27ae60' },
    { key: 'CANCELLED', label: t('status.cancelledM'), color: '#e74c3c' },
  ], [t]);

  const HOLIDAY_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = useMemo(() => ({
    National: { bg: '#e8f5e9', border: '#43a047', text: '#2e7d32', label: t('calendar.holidays.national') },
    Religious: { bg: '#f3e5f5', border: '#8e24aa', text: '#6a1b9a', label: t('calendar.holidays.religious') },
    Exceptional: { bg: '#fff3e0', border: '#fb8c00', text: '#e65100', label: t('calendar.holidays.exceptional') },
  }), [t]);

  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    new Set(STATUS_CONFIG.map(s => s.key))
  );

  const [formData, setFormData] = useState<{
    patientId?: number;
    doctorId?: number;
    startAt?: Date;
    endAt?: Date;
    reason?: string;
    notes?: string;
    type?: string;
  }>({});

  const holidayEvents = useMemo(() => {
    if (!showHolidays) return [];
    return holidays.map(h => {
      const colors = HOLIDAY_COLORS[h.holiday_type] || HOLIDAY_COLORS.Exceptional;
      return {
        id: `holiday-${h.date}`,
        title: h.description,
        start: h.date,
        allDay: true,
        display: 'background',
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text,
        extendedProps: { isHoliday: true, holidayType: h.holiday_type },
      };
    });
  }, [holidays, showHolidays, HOLIDAY_COLORS]);

  const filteredEvents = useMemo(() => {
    const filtered = events.filter(event => {
      const status = event.extendedProps?.status || event.status;
      if (!status) return true;
      return activeFilters.has(status);
    });
    return [...filtered, ...holidayEvents];
  }, [events, activeFilters, holidayEvents]);

  const toggleFilter = (statusKey: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(statusKey)) {
        next.delete(statusKey);
      } else {
        next.add(statusKey);
      }
      return next;
    });
  };

  const lastDateRange = useRef<string>('');
  const loadedYears = useRef<Set<number>>(new Set());

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadHolidays = async (year: number) => {
    if (loadedYears.current.has(year)) return;
    loadedYears.current.add(year);
    try {
      const data = await holidayService.getHolidays(year);
      setHolidays(prev => {
        const existingDates = new Set(prev.map(h => h.date));
        const newHolidays = data.filter(h => !existingDates.has(h.date));
        return [...prev, ...newHolidays];
      });
    } catch (error) {
      loadedYears.current.delete(year);
      console.error('Failed to load holidays:', error);
    }
  };

  const loadEvents = useCallback(async (start: Date, end: Date) => {
    const rangeKey = `${start.toISOString()}_${end.toISOString()}`;
    if (lastDateRange.current === rangeKey) return;
    lastDateRange.current = rangeKey;

    try {
      const data = await appointmentService.getCalendarEvents({
        start: start.toISOString(),
        end: end.toISOString(),
      });
      setEvents(data);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('calendar.loadError'),
      });
    }
  }, [t]);

  const handleDatesSet = useCallback((dateInfo: any) => {
    loadEvents(dateInfo.start, dateInfo.end);
    // Load holidays for any year visible in the range
    const startYear = dateInfo.start.getFullYear();
    const endYear = dateInfo.end.getFullYear();
    loadHolidays(startYear);
    if (endYear !== startYear) {
      loadHolidays(endYear);
    }
  }, [loadEvents]);

  const reloadEvents = useCallback(() => {
    lastDateRange.current = ''; // force refetch
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      loadEvents(calendarApi.view.activeStart, calendarApi.view.activeEnd);
    }
  }, [loadEvents]);

  const loadDoctors = async () => {
    try {
      const response = await userService.getDoctors();
      const doctorUsers = response.data
        .filter(user => user.roles.includes('ROLE_MEDECIN') && user.isActive === true)
        .map(user => ({ ...user, fullName: `${user.firstName} ${user.lastName}` }));
      setDoctors(doctorUsers);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
        detail: t('calendar.loadDoctorsError'),
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
        summary: t('common.error'),
        detail: t('calendar.requiredFields'),
      });
      return;
    }

    setLoading(true);
    try {
      if (editingAppointment) {
        await appointmentService.updateAppointment(editingAppointment.id, formData as any);
        toast.current?.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('calendar.updated'),
        });
      } else {
        await appointmentService.createAppointment(formData as any);
        toast.current?.show({
          severity: 'success',
          summary: t('common.success'),
          detail: t('calendar.created'),
        });
      }
      setDialogVisible(false);
      reloadEvents();
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: t('common.error'),
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
            label={t('common.delete')}
            icon="pi pi-trash"
            className="p-button-danger"
            onClick={() => { }}
          />
        )}
      </div>
      <div className="flex gap-2">
        <Button
          label={t('common.cancel')}
          icon="pi pi-times"
          className="p-button-text"
          onClick={() => setDialogVisible(false)}
        />
        <Button
          label={editingAppointment ? t('common.edit') : t('common.create')}
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
        <h1 className="text-3xl font-bold m-0">{t('calendar.title')}</h1>
        <div className="flex gap-2">
          <Button
            label={t('calendar.today')}
            icon="pi pi-calendar"
            className="p-button-secondary"
            onClick={() => calendarRef.current?.getApi().today()}
          />
          <Button
            label={t('calendar.newAppointment')}
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
      <div className="flex gap-3 mb-2 flex-wrap">
        {STATUS_CONFIG.map(({ key, label, color }) => (
          <div
            key={key}
            className="ml-0 flex align-items-center gap-2 cursor-pointer px-2 py-1 border-round transition-all transition-duration-200"
            style={{
              opacity: activeFilters.has(key) ? 1 : 0.35,
              border: `2px solid ${activeFilters.has(key) ? color : 'transparent'}`,
            }}
            onClick={() => toggleFilter(key)}
          >
            <div className="w-3 h-3 border-circle" style={{ backgroundColor: color }}></div>
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Holiday Legend */}
      <div className="flex gap-3 mb-4 flex-wrap align-items-center">
        <div
          className="flex align-items-center gap-2 cursor-pointer px-2 py-1 border-round transition-all transition-duration-200"
          style={{
            opacity: showHolidays ? 1 : 0.45,
            border: `2px solid ${showHolidays ? '#666' : 'transparent'}`,
          }}
          onClick={() => setShowHolidays(!showHolidays)}
        >
          <i className="pi pi-calendar text-sm"></i>
          <span className="text-sm font-medium">{t('calendar.holidays.title')}</span>
        </div>
        {showHolidays && Object.entries(HOLIDAY_COLORS).map(([type, colors]) => (
          <div key={type} className="flex align-items-center gap-2 px-2 py-1">
            <div className="w-3 h-3 border-round" style={{ backgroundColor: colors.bg, border: `2px solid ${colors.border}` }}></div>
            <span className="text-sm" style={{ color: colors.text }}>{colors.label}</span>
          </div>
        ))}
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
          events={filteredEvents}
          datesSet={handleDatesSet}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          locale={t('calendar.locale')}
          buttonText={{
            today: t('calendar.today'),
            month: t('calendar.month'),
            week: t('calendar.week'),
            day: t('calendar.day'),
          }}
          allDayText={t('calendar.allDay')}
          slotMinTime="08:00:00"
          slotMaxTime="19:00:00"
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
        header={editingAppointment ? t('calendar.editDialog') : t('calendar.newDialog')}
        className="w-11/12 md:w-6 lg:w-8"
        footer={dialogFooter}
      >
        <div className="flex flex-column gap-3">
          <div className="grid">
            <div className="field col-12 md:col-6 field">
              <label className="block font-medium mb-2">{t('calendar.form.patient')}</label>
              <AutoComplete
                value={selectedPatient}
                suggestions={patients}
                completeMethod={searchPatients}
                field="fullName"
                onChange={(e) => {
                  setSelectedPatient(e.value);
                  setFormData({ ...formData, patientId: e.value?.id });
                }}
                placeholder={t('calendar.form.searchPatient')}
                className="w-full"
                inputClassName="w-full"
              />
            </div>

            <div className="field col-12 md:col-6 field">
              <label className="block font-medium mb-2">{t('calendar.form.doctor')}</label>
              <Dropdown
                value={formData.doctorId}
                options={doctors}
                optionLabel="fullName"
                optionValue="id"
                onChange={(e) => setFormData({ ...formData, doctorId: e.value })}
                placeholder={t('calendar.form.selectDoctor')}
                className="w-full"
              />
            </div>
          </div>
          <div className="grid">
            <div className="col-6 field">
              <label className="block font-medium mb-2">{t('calendar.form.start')}</label>
              <PrimeCalendar
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.value || undefined })}
                showTime
                hourFormat="24"
                className="w-full"
                placeholder={t('calendar.form.dateTimePlaceholder')}
                minDate={new Date()}
              />
            </div>
            <div className="col-6 field">
              <label className="block font-medium mb-2">{t('calendar.form.end')}</label>
              <PrimeCalendar
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.value || undefined })}
                showTime
                hourFormat="24"
                className="w-full"
                placeholder={t('calendar.form.dateTimePlaceholder')}
                minDate={new Date()}
              />
            </div>
          </div>

          <div className="field">
            <label className="block font-medium mb-2">{t('calendar.form.type')}</label>
            <Dropdown
              value={formData.type}
              options={[
                { label: t('appointments.types.consultation'), value: 'CONSULTATION' },
                { label: t('appointments.types.follow_up'), value: 'FOLLOW_UP' },
                { label: t('appointments.types.examination'), value: 'EXAMINATION' },
                { label: t('appointments.types.emergency'), value: 'EMERGENCY' },
              ]}
              onChange={(e) => setFormData({ ...formData, type: e.value })}
              placeholder={t('calendar.form.selectType')}
              className="w-full"
            />
          </div>

          <div className="field">
            <label className="block font-medium mb-2">{t('calendar.form.reason')}</label>
            <InputText
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full"
              placeholder={t('calendar.form.reasonPlaceholder')}
            />
          </div>

          <div className="field">
            <label className="block font-medium mb-2">{t('calendar.form.notes')}</label>
            <InputTextarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full"
              rows={3}
              placeholder={t('calendar.form.notesPlaceholder')}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Calendar;
