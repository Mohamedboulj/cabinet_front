import api from './api';
import type { Patient, ApiResponse } from '../types';

interface PatientListParams {
  search?: string;
  page?: number;
  limit?: number;
}

interface PatientStatistics {
  total: number;
  newThisMonth: number;
  newToday: number;
}

export const patientService = {
  async getPatients(params: PatientListParams = {}): Promise<ApiResponse<Patient[]>> {
    const response = await api.get('/patients', { params });
    return response.data;
  },

  async searchPatients(query: string): Promise<ApiResponse<Patient[]>> {
    const response = await api.get('/patients/search', { params: { q: query } });
    return response.data;
  },

  async getRecentPatients(limit: number = 10): Promise<ApiResponse<Patient[]>> {
    const response = await api.get('/patients/recent', { params: { limit } });
    return response.data;
  },

  async getPatientStatistics(): Promise<PatientStatistics> {
    const response = await api.get('/patients/statistics');
    return response.data;
  },

  async getPatient(id: number): Promise<ApiResponse<Patient>> {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  async createPatient(patient: Partial<Patient>): Promise<ApiResponse<Patient>> {
    const response = await api.post('/patients', patient);
    return response.data;
  },

  async updatePatient(id: number, patient: Partial<Patient>): Promise<ApiResponse<Patient>> {
    const response = await api.put(`/patients/${id}`, patient);
    return response.data;
  },

  async deletePatient(id: number): Promise<void> {
    await api.delete(`/patients/${id}`);
  },

  async checkPhone(phone: string): Promise<{ exists: boolean; patient?: Patient }> {
    const response = await api.get(`/patients/check-phone/${phone}`);
    return response.data;
  },

  async checkCin(cin: string): Promise<{ exists: boolean; patient?: Patient }> {
    const response = await api.get(`/patients/check-cin/${cin}`);
    return response.data;
  },

  async validateImportFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/patients/import/validate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },

  async importPatients(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/patients/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },
};
