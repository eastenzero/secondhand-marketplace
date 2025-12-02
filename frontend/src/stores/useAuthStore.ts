import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    role: 'user' | 'admin';
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
    login: (user: User, token?: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            token: null,
            login: (user, token) => set({ user, isAuthenticated: true, token: token || null }),
            logout: () => set({ user: null, isAuthenticated: false, token: null }),
        }),
        {
            name: 'auth-storage', // unique name
        }
    )
);
