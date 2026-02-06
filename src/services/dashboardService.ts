import api from './api';
import type { DashboardStats, Appointment, Consultation, Invoice, Payment } from '../types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  async getTodayData(): Promise<{
    appointments: { data: Appointment[]; count: number };
    consultations: { data: Consultation[]; count: number };
  }> {
    const response = await api.get('/dashboard/today');
    return response.data;
  },

  async getUpcomingAppointments(): Promise<{ data: Appointment[] }> {
    const response = await api.get('/dashboard/upcoming-appointments');
    return response.data;
  },

  async getRecentPayments(): Promise<{ data: Payment[] }> {
    const response = await api.get('/dashboard/recent-payments');
    return response.data;
  },

  async getUnpaidInvoices(): Promise<{ data: Invoice[]; count: number; totalAmount: number }> {
    const response = await api.get('/dashboard/unpaid-invoices');
    return response.data;
  },

  async getRevenueChart(): Promise<any> {
    const response = await api.get('/dashboard/revenue-chart');
    return response.data;
  },

  async getAppointmentsByDoctor(): Promise<{ data: any[] }> {
    const response = await api.get('/dashboard/appointments-by-doctor');
    return response.data;
  },

  async getConsultationsByDoctor(): Promise<{ data: any[] }> {
    const response = await api.get('/dashboard/consultations-by-doctor');
    return response.data;
  },

  async getTopMedications(): Promise<{ data: any[] }> {
    const response = await api.get('/dashboard/top-medications');
    return response.data;
  },

  async getCommonReasons(): Promise<{ data: any[] }> {
    const response = await api.get('/dashboard/common-reasons');
    return response.data;
  },

  async getPaymentMethods(): Promise<{ data: any[] }> {
    const response = await api.get('/dashboard/payment-methods');
    return response.data;
  },
};
