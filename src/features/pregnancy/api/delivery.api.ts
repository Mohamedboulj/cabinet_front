import api from '@/lib/axios';
import type { DeliveryRecord, Newborn, ApiResponse } from '@/types';

export interface NewbornPayload {
    birthOrder?: number;
    sex: string;
    weightGrams: number;
    lengthCm?: number;
    headCircumferenceCm?: number;
    apgar1?: number;
    apgar5?: number;
    apgar10?: number;
    isAlive?: boolean;
    resuscitationRequired?: boolean;
    nicuAdmission?: boolean;
    feedingType?: string;
    congenitalAnomalies?: string;
    notes?: string;
}

export interface DeliveryPayload {
    deliveryAt: string;
    mode: string;
    gestationalWeeksAtBirth: number;
    gestationalDaysAtBirth?: number;
    place?: string;
    attendedBy?: string;
    indication?: string;
    laborDurationMinutes?: number;
    anesthesia?: string;
    episiotomy?: boolean;
    perinealTear?: string;
    bloodLossMl?: number;
    complications?: string;
    outcome?: string;
    newborns?: NewbornPayload[];
}

export const deliveryService = {
    async getDelivery(pregnancyId: number): Promise<ApiResponse<DeliveryRecord>> {
        const response = await api.get(`/pregnancies/${pregnancyId}/delivery`);
        return response.data;
    },

    async createDelivery(pregnancyId: number, payload: DeliveryPayload): Promise<ApiResponse<DeliveryRecord>> {
        const response = await api.post(`/pregnancies/${pregnancyId}/delivery`, payload);
        return response.data;
    },

    async updateDelivery(pregnancyId: number, payload: Partial<DeliveryPayload>): Promise<ApiResponse<DeliveryRecord>> {
        const response = await api.patch(`/pregnancies/${pregnancyId}/delivery`, payload);
        return response.data;
    },

    async deleteDelivery(pregnancyId: number): Promise<void> {
        await api.delete(`/pregnancies/${pregnancyId}/delivery`);
    },

    async addNewborn(deliveryId: number, payload: NewbornPayload): Promise<ApiResponse<Newborn>> {
        const response = await api.post(`/deliveries/${deliveryId}/newborns`, payload);
        return response.data;
    },

    async updateNewborn(id: number, payload: Partial<NewbornPayload>): Promise<ApiResponse<Newborn>> {
        const response = await api.patch(`/newborns/${id}`, payload);
        return response.data;
    },

    async deleteNewborn(id: number): Promise<void> {
        await api.delete(`/newborns/${id}`);
    },
};
