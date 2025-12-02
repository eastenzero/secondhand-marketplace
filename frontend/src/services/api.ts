import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/lib/errors';
import { useAuthStore } from '@/stores/useAuthStore';
import { setupMockAdapter } from '@/mock/adapter';

export const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
});

// Enable mock data for frontend verification
setupMockAdapter(api);

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    logger.error('Request error', error);
    return Promise.reject(error);
});

interface ApiErrorData {
    code?: string;
    message?: string;
}

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorData>) => {
        const status = error.response?.status;
        const data = error.response?.data;
        const code = data?.code;
        const message = data?.message;

        logger.error('API Error', error, {
            url: error.config?.url,
            status,
            code
        });

        // Handle specific status codes
        if (status === 401) {
            useAuthStore.getState().logout();
            // Optional: Redirect to login if not already there
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
                toast.error('登录已过期，请重新登录');
            }
            return Promise.reject(error);
        }

        if (status === 403) {
            toast.error(getErrorMessage('FORBIDDEN', '无权访问'));
            return Promise.reject(error);
        }

        if (status === 404) {
            // Let the component handle 404 if needed, or show a generic toast
            // toast.error('资源不存在');
            return Promise.reject(error);
        }

        if (status && status >= 500) {
            toast.error(getErrorMessage('INTERNAL_ERROR'));
            return Promise.reject(error);
        }

        // Handle business errors with codes
        if (code) {
            const userMessage = getErrorMessage(code, message);
            // Don't show toast for some codes that are handled by components (e.g. form validation)
            // For now, we show toast for most, unless suppressed via config
            // We can add a custom config to the request to suppress global error toast
            if (!(error.config as any)?.suppressErrorToast) {
                toast.error(userMessage);
            }
        } else if (!window.navigator.onLine) {
            toast.error(getErrorMessage('NETWORK_ERROR'));
        } else {
            // Generic error
            toast.error(message || '请求失败');
        }

        return Promise.reject(error);
    }
);
