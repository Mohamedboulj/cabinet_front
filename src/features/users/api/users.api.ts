import api from '@/lib/axios';
import type { User, ApiResponse } from '@/types';

export const userService = {
    async getUsers(): Promise<ApiResponse<User[]>> {
        const response = await api.get('/users');
        return response.data;
    },

    async createUser(user: Partial<User> | FormData): Promise<ApiResponse<User>> {
        const config = user instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        const response = await api.post('/users', user, config);
        return response.data;
    },

    async resetPassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
        await api.post(`/users/${id}/reset-password`, { currentPassword, newPassword });
    },

    async deactivateUser(id: number): Promise<void> {
        await api.post(`/users/${id}/deactivate`);
    },

    async activateUser(id: number): Promise<void> {
        await api.post(`/users/${id}/activate`);
    },

    async updateUser(id: number, data: Partial<User> | FormData): Promise<void> {
        const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        await api.put(`/users/${id}`, data, config);
    },

    async getDoctors(): Promise<ApiResponse<User[]>> {
        const response = await api.get('/users/doctors');
        return response.data;
    }
};
