import api from './api';
import type { Consultation, ApiResponse } from '../types';

interface ConsultationListParams {
    search?: string;
    page?: number;
    limit?: number;
    status?: string;
    doctorId?: number;
    patientId?: number;
}

interface ConsultationStatistics {
    total: number;
    completed: number;
    inProgress: number;
    cancelled: number;
    unpaid: number;
}

export const consultationService = {
    async getConsultations(params: ConsultationListParams = {}): Promise<ApiResponse<Consultation[]>> {
        const response = await api.get('/consultations', { params });
        return response.data;
    },

    async getConsultation(id: number): Promise<ApiResponse<Consultation>> {
        const response = await api.get(`/consultations/${id}`);
        return response.data;
    },

    async createConsultation(consultation: Partial<Consultation>): Promise<ApiResponse<Consultation>> {
        const response = await api.post('/consultations', consultation);
        console.log(response);
        return response.data;
    },

    async updateConsultation(id: number, consultation: Partial<Consultation>): Promise<ApiResponse<Consultation>> {
        const response = await api.put(`/consultations/${id}`, consultation);
        return response.data;
    },

    async deleteConsultation(id: number): Promise<void> {
        await api.delete(`/consultations/${id}`);
    },

    async completeConsultation(id: number): Promise<ApiResponse<Consultation>> {
        const response = await api.post(`/consultations/${id}/complete`);
        return response.data;
    },

    async cancelConsultation(id: number): Promise<ApiResponse<Consultation>> {
        const response = await api.post(`/consultations/${id}/cancel`);
        return response.data;
    },

    async getConsultationStatistics(): Promise<ConsultationStatistics> {
        const response = await api.get('/consultations/statistics');
        return response.data;
    },
};
