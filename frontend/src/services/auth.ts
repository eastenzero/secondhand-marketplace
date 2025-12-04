import { api } from './api';

export interface LoginRequest {
    username: string;
    password?: string; // Optional in some flows, but required here
}

export interface RegisterRequest {
    username: string;
    password?: string;
    contact?: {
        email?: string;
        phone?: string;
    };
}

export interface AuthResponse {
    user: {
        id: string;
        name: string;
        role: 'user' | 'admin';
    };
    token?: string; // If using token-based auth
}

export interface RegisterResponse {
    userId: number;
}

export const authService = {
    login: async (data: LoginRequest): Promise<void> => {
        await api.post<void>('/login', data);
    },

    register: async (data: RegisterRequest) => {
        const response = await api.post<RegisterResponse>('/register', data);
        return response.data;
    },

    logout: async () => {
        // If backend has a logout endpoint to clear cookies
        await api.post('/logout');
    },

    me: async () => {
        const response = await api.get<AuthResponse['user']>('/me');
        return response.data;
    }
};
