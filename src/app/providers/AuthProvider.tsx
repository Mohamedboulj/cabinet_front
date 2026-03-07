import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginCredentials, AuthState } from '@/types';
import { authService } from '@/features/auth/api/auth.api';
import api from '@/lib/axios';
import { setCurrency, removeCurrency } from '@/utils/currencyUtils';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [state, setState] = useState<AuthState>({
        user: null,
        token: localStorage.getItem('token'),
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const user = await authService.getCurrentUser();
                    setCurrency(user.currency || 'MAD');
                    setState({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    localStorage.removeItem('token');
                    setState({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            } else {
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const { token } = await authService.login(credentials);
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const user = await authService.getCurrentUser();
            setCurrency(user.currency || 'MAD');

            setState({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
            });

            navigate('/dashboard');
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        removeCurrency();
        delete api.defaults.headers.common['Authorization'];
        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
        navigate('/login');
    };

    const hasRole = (role: string): boolean => {
        return state.user?.roles.includes(role) ?? false;
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                logout,
                hasRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
