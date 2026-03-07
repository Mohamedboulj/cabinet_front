import api from '@/lib/axios';
import type { Prescription, ApiResponse } from '@/types';

interface PrescriptionListParams {
    search?: string;
    page?: number;
    limit?: number;
    consultationId?: number;
    patientId?: number;
}

export const prescriptionService = {
    async getPrescriptions(params: PrescriptionListParams = {}): Promise<ApiResponse<Prescription[]>> {
        const response = await api.get('/prescriptions', { params });
        return response.data;
    },

    async getPrescription(id: number): Promise<ApiResponse<Prescription>> {
        const response = await api.get(`/prescriptions/${id}`);
        return response.data;
    },

    async createPrescription(prescription: Partial<Prescription>): Promise<ApiResponse<Prescription>> {
        const response = await api.post('/prescriptions', prescription);
        return response.data;
    },

    async updatePrescription(id: number, prescription: Partial<Prescription>): Promise<ApiResponse<Prescription>> {
        const response = await api.put(`/prescriptions/${id}`, prescription);
        return response.data;
    },

    async deletePrescription(id: number): Promise<void> {
        await api.delete(`/prescriptions/${id}`);
    },
};
