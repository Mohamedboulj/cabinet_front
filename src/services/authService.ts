import api from './api';
import type { User, LoginCredentials } from '../types';

interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post('/login_check', credentials);
    return {
      token: response.data.token,
      user: response.data.user,
    };
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/me');
    return response.data.user;
  },

  async logout(): Promise<void> {
    await api.post('/logout');
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/change-password', {
      currentPassword,
      newPassword,
    });
  },
};
