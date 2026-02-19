import api from './api';
import type { Invoice, Payment, ApiResponse } from '../types';

interface InvoiceListParams {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    patientId?: number;
}

interface PaymentData {
    amount: string;
    paymentMethod: string;
    paymentDate?: string;
    transactionReference?: string;
    checkNumber?: string;
    bankName?: string;
    notes?: string;
}

export const invoiceService = {
    async getInvoices(params: InvoiceListParams = {}): Promise<ApiResponse<Invoice[]>> {
        const response = await api.get('/invoices', { params });
        return response.data;
    },

    async getInvoice(id: number): Promise<ApiResponse<Invoice>> {
        const response = await api.get(`/invoices/${id}`);
        return response.data;
    },

    async createInvoice(invoice: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
        const response = await api.post('/invoices', invoice);
        return response.data;
    },

    async updateInvoice(id: number, invoice: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
        const response = await api.put(`/invoices/${id}`, invoice);
        return response.data;
    },

    async deleteInvoice(id: number): Promise<void> {
        await api.delete(`/invoices/${id}`);
    },

    async cancelInvoice(id: number): Promise<ApiResponse<Invoice>> {
        const response = await api.post(`/invoices/${id}/cancel`);
        return response.data;
    },

    async addPayment(invoiceId: number, payment: PaymentData): Promise<ApiResponse<Payment>> {
        const response = await api.post(`/invoices/${invoiceId}/add-payment`, payment);
        return response.data;
    },

    async printInvoice(id: number): Promise<Blob> {
        const response = await api.get(`/invoices/${id}/print`, {
            responseType: 'blob',
        });
        return response.data;
    },
};
