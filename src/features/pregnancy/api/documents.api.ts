import api from '@/lib/axios';
import type { MedicalDocument, ApiResponse } from '@/types';

export interface DocumentListParams {
    patientId?: number;
    pregnancyId?: number;
    type?: string;
}

export interface DocumentUploadPayload {
    file: File;
    patientId: number;
    type: string;
    title: string;
    description?: string;
    documentDate?: string;
    issuedBy?: string;
    isConfidential?: boolean;
    consultationId?: number;
    pregnancyId?: number;
    ultrasoundId?: number;
    obstetricLabId?: number;
}

export const documentService = {
    async getDocuments(params: DocumentListParams = {}): Promise<ApiResponse<MedicalDocument[]>> {
        const response = await api.get('/documents', { params });
        return response.data;
    },

    async getDocument(id: number): Promise<ApiResponse<MedicalDocument>> {
        const response = await api.get(`/documents/${id}`);
        return response.data;
    },

    async uploadDocument(payload: DocumentUploadPayload): Promise<ApiResponse<MedicalDocument>> {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value as string | Blob);
            }
        });
        const response = await api.post('/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    async deleteDocument(id: number): Promise<void> {
        await api.delete(`/documents/${id}`);
    },

    downloadUrl(id: number): string {
        return `/documents/${id}/download`;
    },

    previewUrl(id: number): string {
        return `/documents/${id}/preview`;
    },
};
