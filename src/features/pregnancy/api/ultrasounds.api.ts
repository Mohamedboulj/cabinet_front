import api from '@/lib/axios';
import type { Ultrasound, Pregnancy, ApiResponse } from '@/types';

export interface UltrasoundPayload {
    type: string;
    performedAt?: string;
    prenatalVisitId?: number;
    performedBy?: string;
    fetusLabel?: string;
    crl?: number;
    bpd?: number;
    hc?: number;
    ac?: number;
    fl?: number;
    efw?: number;
    efwPercentile?: number;
    nuchalTranslucency?: number;
    amnioticFluidIndex?: number;
    amnioticFluid?: string;
    placentaLocation?: string;
    placentaGrade?: string;
    presentation?: string;
    fetalHeartRate?: number;
    cervicalLength?: number;
    dopplerUmbilicalPi?: number;
    dopplerNotes?: string;
    findings?: string;
    conclusion?: string;
    isNormal?: boolean;
}

export const ultrasoundService = {
    async getUltrasounds(pregnancyId: number): Promise<ApiResponse<Ultrasound[]>> {
        const response = await api.get(`/pregnancies/${pregnancyId}/ultrasounds`);
        return response.data;
    },

    async createUltrasound(pregnancyId: number, payload: UltrasoundPayload): Promise<ApiResponse<Ultrasound>> {
        const response = await api.post(`/pregnancies/${pregnancyId}/ultrasounds`, payload);
        return response.data;
    },

    async getUltrasound(id: number): Promise<ApiResponse<Ultrasound>> {
        const response = await api.get(`/ultrasounds/${id}`);
        return response.data;
    },

    async updateUltrasound(id: number, payload: Partial<UltrasoundPayload>): Promise<ApiResponse<Ultrasound>> {
        const response = await api.patch(`/ultrasounds/${id}`, payload);
        return response.data;
    },

    async deleteUltrasound(id: number): Promise<void> {
        await api.delete(`/ultrasounds/${id}`);
    },

    async applyDating(id: number): Promise<ApiResponse<Pregnancy>> {
        const response = await api.post(`/ultrasounds/${id}/apply-dating`);
        return response.data;
    },
};
