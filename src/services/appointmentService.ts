import api from './api';
import type { Appointment, ApiResponse } from '../types';

interface AppointmentListParams {
  start?: string;
  end?: string;
  doctorId?: number;
}

interface AppointmentStatistics {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export const appointmentService = {
  async getAppointments(params: AppointmentListParams = {}): Promise<ApiResponse<Appointment[]>> {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  async getCalendarEvents(params: AppointmentListParams = {}): Promise<any[]> {
    const response = await api.get('/appointments/calendar', { params });
    return response.data;
  },

  async getTodayAppointments(doctorId?: number): Promise<ApiResponse<Appointment[]>> {
    const response = await api.get('/appointments/today', { params: { doctorId } });
    return response.data;
  },

  async getUpcomingAppointments(limit: number = 10): Promise<ApiResponse<Appointment[]>> {
    const response = await api.get('/appointments/upcoming', { params: { limit } });
    return response.data;
  },

  async getAppointmentStatistics(start?: string, end?: string): Promise<AppointmentStatistics> {
    const response = await api.get('/appointments/statistics', { params: { start, end } });
    return response.data;
  },

  async getAppointment(id: number): Promise<ApiResponse<Appointment>> {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  async createAppointment(appointment: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    const response = await api.post('/appointments', appointment);
    return response.data;
  },

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    const response = await api.put(`/appointments/${id}`, appointment);
    return response.data;
  },

  async cancelAppointment(id: number): Promise<ApiResponse<Appointment>> {
    const response = await api.post(`/appointments/${id}/cancel`);
    return response.data;
  },

  async confirmAppointment(id: number): Promise<ApiResponse<Appointment>> {
    const response = await api.post(`/appointments/${id}/confirm`);
    return response.data;
  },

  async completeAppointment(id: number): Promise<ApiResponse<Appointment>> {
    const response = await api.post(`/appointments/${id}/complete`);
    return response.data;
  },

  async deleteAppointment(id: number): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },
};
