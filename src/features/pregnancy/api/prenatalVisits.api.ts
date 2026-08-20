import api from '@/lib/axios';
import type { PrenatalVisit, PregnancyAlert, ApiResponse } from '@/types';

export interface PrenatalVisitPayload {
    visitDate?: string;
    consultationId?: number;
    doctorId?: number;
    weight?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    fundalHeight?: number;
    fetalHeartRate?: number;
    fetalMovements?: string;
    fetalPresentation?: string;
    edema?: string;
    proteinuria?: string;
    glycosuria?: string;
    uterineContractions?: boolean;
    cervixExam?: string;
    complaints?: string;
    examination?: string;
    diagnosis?: string;
    recommendations?: string;
    notes?: string;
    nextVisitDate?: string;
}

export const prenatalVisitService = {
    async getVisits(pregnancyId: number): Promise<ApiResponse<PrenatalVisit[]>> {
        const response = await api.get(`/pregnancies/${pregnancyId}/prenatal-visits`);
        return response.data;
    },

    async createVisit(pregnancyId: number, payload: PrenatalVisitPayload): Promise<ApiResponse<PrenatalVisit>> {
        const response = await api.post(`/pregnancies/${pregnancyId}/prenatal-visits`, payload);
        return response.data;
    },

    async getVisit(id: number): Promise<ApiResponse<PrenatalVisit>> {
        const response = await api.get(`/prenatal-visits/${id}`);
        return response.data;
    },

    async getVisitAlerts(id: number): Promise<{ data: PregnancyAlert[] }> {
        const response = await api.get(`/prenatal-visits/${id}/alerts`);
        return response.data;
    },

    async updateVisit(id: number, payload: Partial<PrenatalVisitPayload>): Promise<ApiResponse<PrenatalVisit>> {
        const response = await api.patch(`/prenatal-visits/${id}`, payload);
        return response.data;
    },

    async deleteVisit(id: number): Promise<void> {
        await api.delete(`/prenatal-visits/${id}`);
    },
};
