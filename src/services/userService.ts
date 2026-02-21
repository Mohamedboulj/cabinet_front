import api from './api';
import type { User, ApiResponse } from '../types';

export const userService = {
  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await api.get('/users');
    return response.data;
  },

  async createUser(user: Partial<User>): Promise<ApiResponse<User>> {
    const response = await api.post('/users', user);
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
};
