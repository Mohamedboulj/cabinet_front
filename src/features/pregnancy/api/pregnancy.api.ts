import api from '@/lib/axios';
import type {
    Pregnancy,
    PregnancyMinimal,
    PregnancyAlert,
    PregnancyAlertFeedItem,
    PregnancyStatistics,
    PregnancyTimelineItem,
    ScheduleMilestone,
    PregnancyChartData,
    PregnancyPrint,
    ApiResponse,
    Appointment,
    PregnancyStatus,
    RiskLevel,
    EddSource,
    BloodGroup,
    Rhesus,
} from '@/types';

export interface PregnancyListParams {
    patientId?: number;
    doctorId?: number;
    status?: PregnancyStatus;
    riskLevel?: RiskLevel;
    page?: number;
    limit?: number;
}

export interface CreatePregnancyPayload {
    patientId: number;
    doctorId?: number;
    lmp: string;
    edd?: string;
    eddSource?: EddSource;
    gravida?: number;
    para?: number;
    abortions?: number;
    livingChildren?: number;
    isMultiple?: boolean;
    fetusCount?: number;
    bloodGroup?: BloodGroup;
    rhesus?: Rhesus;
    riskLevel?: RiskLevel;
    riskFactors?: string[];
    prePregnancyWeight?: number;
    height?: number;
    obstetricHistoryNotes?: string;
    medicalHistoryNotes?: string;
}

export const pregnancyService = {
    async getPregnancies(params: PregnancyListParams = {}): Promise<ApiResponse<Pregnancy[]>> {
        const response = await api.get('/pregnancies', { params });
        return response.data;
    },

    async getActivePregnancies(): Promise<{ data: PregnancyMinimal[]; count: number }> {
        const response = await api.get('/pregnancies/active');
        return response.data;
    },

    async getDueSoon(days: number = 30): Promise<{ data: PregnancyMinimal[]; count: number }> {
        const response = await api.get('/pregnancies/due-soon', { params: { days } });
        return response.data;
    },

    async getAlertsInbox(): Promise<{ data: PregnancyAlertFeedItem[]; count: number }> {
        const response = await api.get('/pregnancies/alerts');
        return response.data;
    },

    async getStatistics(start?: string, end?: string): Promise<PregnancyStatistics> {
        const response = await api.get('/pregnancies/statistics', { params: { start, end } });
        return response.data;
    },

    async getPregnancy(id: number): Promise<ApiResponse<Pregnancy>> {
        const response = await api.get(`/pregnancies/${id}`);
        return response.data;
    },

    async getAlerts(id: number): Promise<{ data: PregnancyAlert[] }> {
        const response = await api.get(`/pregnancies/${id}/alerts`);
        return response.data;
    },

    async getChartData(id: number): Promise<{ data: PregnancyChartData }> {
        const response = await api.get(`/pregnancies/${id}/chart-data`);
        return response.data;
    },

    async getTimeline(id: number): Promise<{ data: PregnancyTimelineItem[] }> {
        const response = await api.get(`/pregnancies/${id}/timeline`);
        return response.data;
    },

    async getSchedule(id: number): Promise<{ data: ScheduleMilestone[] }> {
        const response = await api.get(`/pregnancies/${id}/schedule`);
        return response.data;
    },

    async generateSchedule(id: number): Promise<ApiResponse<Appointment[]>> {
        const response = await api.post(`/pregnancies/${id}/schedule/generate`);
        return response.data;
    },

    async getPrint(id: number): Promise<{ data: PregnancyPrint } | PregnancyPrint> {
        const response = await api.get(`/pregnancies/${id}/print`);
        return response.data;
    },

    async createPregnancy(payload: CreatePregnancyPayload): Promise<ApiResponse<Pregnancy>> {
        const response = await api.post('/pregnancies', payload);
        return response.data;
    },

    async updatePregnancy(id: number, payload: Partial<CreatePregnancyPayload>): Promise<ApiResponse<Pregnancy>> {
        const response = await api.patch(`/pregnancies/${id}`, payload);
        return response.data;
    },

    async closePregnancy(id: number, status?: PregnancyStatus, closureReason?: string): Promise<ApiResponse<Pregnancy>> {
        const response = await api.post(`/pregnancies/${id}/close`, { status, closureReason });
        return response.data;
    },

    async reopenPregnancy(id: number): Promise<ApiResponse<Pregnancy>> {
        const response = await api.post(`/pregnancies/${id}/reopen`);
        return response.data;
    },

    async deletePregnancy(id: number): Promise<void> {
        await api.delete(`/pregnancies/${id}`);
    },

    async getPatientPregnancies(patientId: number): Promise<ApiResponse<Pregnancy[]>> {
        const response = await api.get(`/patients/${patientId}/pregnancies`);
        return response.data;
    },
};

export const pregnancyToolsService = {
    async getEdd(lmp: string): Promise<{ lmp: string; edd: string; gestationalAge: string }> {
        const response = await api.get('/pregnancy-tools/edd', { params: { lmp } });
        return response.data;
    },

    async getGestationalAge(lmp: string, date?: string): Promise<{ gestationalAge: string; trimester: number }> {
        const response = await api.get('/pregnancy-tools/gestational-age', { params: { lmp, date } });
        return response.data;
    },

    async getEddFromCrl(crl: number, date?: string): Promise<{ crl: number; scanDate: string; edd: string; lmp: string }> {
        const response = await api.get('/pregnancy-tools/edd-from-crl', { params: { crl, date } });
        return response.data;
    },
};
