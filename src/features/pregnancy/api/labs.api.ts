import api from '@/lib/axios';
import type { ObstetricLab, ObstetricLabCatalogItem, ApiResponse } from '@/types';

export interface ObstetricLabPayload {
    category: string;
    testCode: string;
    testName: string;
    prescribedAt?: string;
    gestationalWeeks?: number;
    value?: string;
    unit?: string;
    referenceRange?: string;
    result?: string;
    resultAt?: string;
    isCritical?: boolean;
    notes?: string;
}

export interface ObstetricLabResultPayload {
    value?: string;
    unit?: string;
    referenceRange?: string;
    result?: string;
    resultAt?: string;
    isCritical?: boolean;
    notes?: string;
}

export const labService = {
    async getCatalog(trimester?: 1 | 2 | 3): Promise<{ data: ObstetricLabCatalogItem[] }> {
        const response = await api.get('/obstetric-labs/catalog', { params: { trimester } });
        return response.data;
    },

    async getLabs(pregnancyId: number): Promise<ApiResponse<ObstetricLab[]>> {
        const response = await api.get(`/pregnancies/${pregnancyId}/labs`);
        return response.data;
    },

    async createLab(pregnancyId: number, payload: ObstetricLabPayload): Promise<ApiResponse<ObstetricLab>> {
        const response = await api.post(`/pregnancies/${pregnancyId}/labs`, payload);
        return response.data;
    },

    async prescribePanel(pregnancyId: number, trimester?: 1 | 2 | 3): Promise<ApiResponse<ObstetricLab[]>> {
        const response = await api.post(`/pregnancies/${pregnancyId}/labs/prescribe-panel`, { trimester });
        return response.data;
    },

    async getLab(id: number): Promise<ApiResponse<ObstetricLab>> {
        const response = await api.get(`/obstetric-labs/${id}`);
        return response.data;
    },

    async updateLab(id: number, payload: ObstetricLabResultPayload): Promise<ApiResponse<ObstetricLab>> {
        const response = await api.patch(`/obstetric-labs/${id}`, payload);
        return response.data;
    },

    async deleteLab(id: number): Promise<void> {
        await api.delete(`/obstetric-labs/${id}`);
    },
};
