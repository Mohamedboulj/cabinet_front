import api from '@/lib/axios';
import type { PostpartumVisit, PregnancyImmunization, ApiResponse } from '@/types';

export interface PostpartumVisitPayload {
    visitDate?: string;
    consultationId?: number;
    weight?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    temperature?: number;
    uterineInvolution?: string;
    lochia?: string;
    perinealHealing?: string;
    breastExam?: string;
    breastfeedingStatus?: string;
    breastfeedingIssues?: string;
    edpsScore?: number;
    contraceptionCounseled?: boolean;
    contraceptionMethod?: string;
    complications?: string;
    notes?: string;
}

export interface ImmunizationPayload {
    type: string;
    administeredAt: string;
    dose?: string;
    batchNumber?: string;
    notes?: string;
}

export const postpartumService = {
    async getVisits(pregnancyId: number): Promise<ApiResponse<PostpartumVisit[]>> {
        const response = await api.get(`/pregnancies/${pregnancyId}/postpartum-visits`);
        return response.data;
    },

    async createVisit(pregnancyId: number, payload: PostpartumVisitPayload): Promise<ApiResponse<PostpartumVisit>> {
        const response = await api.post(`/pregnancies/${pregnancyId}/postpartum-visits`, payload);
        return response.data;
    },

    async updateVisit(id: number, payload: Partial<PostpartumVisitPayload>): Promise<ApiResponse<PostpartumVisit>> {
        const response = await api.patch(`/postpartum-visits/${id}`, payload);
        return response.data;
    },

    async deleteVisit(id: number): Promise<void> {
        await api.delete(`/postpartum-visits/${id}`);
    },
};

export const immunizationService = {
    async getImmunizations(pregnancyId: number): Promise<ApiResponse<PregnancyImmunization[]>> {
        const response = await api.get(`/pregnancies/${pregnancyId}/immunizations`);
        return response.data;
    },

    async createImmunization(pregnancyId: number, payload: ImmunizationPayload): Promise<ApiResponse<PregnancyImmunization>> {
        const response = await api.post(`/pregnancies/${pregnancyId}/immunizations`, payload);
        return response.data;
    },

    async deleteImmunization(id: number): Promise<void> {
        await api.delete(`/immunizations/${id}`);
    },
};
