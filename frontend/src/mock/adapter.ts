import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { MOCK_USER, MOCK_ADMIN, MOCK_ITEMS, MOCK_DEMANDS, MOCK_COMMENTS } from './data';

// Simple mock adapter
export function setupMockAdapter(axiosInstance: AxiosInstance) {
    const originalAdapter = axiosInstance.defaults.adapter;

    axiosInstance.defaults.adapter = async (config: AxiosRequestConfig) => {
        const { url, method, params, data } = config;
        const methodUpper = method?.toUpperCase();

        console.log(`[Mock API] ${methodUpper} ${url}`, { params, data });

        // Helper to return success response
        const success = (data: unknown) => {
            return Promise.resolve({
                data,
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
                request: {},
            } as AxiosResponse);
        };

        // Helper to return error response
        const error = (status: number, message: string) => {
            const err = new Error(`Request failed with status code ${status}`) as any;
            err.response = {
                data: { code: 'MOCK_ERROR', message },
                status,
                statusText: 'Error',
                headers: {},
                config,
            };
            return Promise.reject(err);
        };

        // --- Auth Routes ---
        if (url === '/auth/login' && methodUpper === 'POST') {
            const body = JSON.parse(data);
            if (body.username === 'admin') {
                return success({ user: MOCK_ADMIN, token: MOCK_ADMIN.token });
            }
            return success({ user: MOCK_USER, token: MOCK_USER.token });
        }

        if (url === '/auth/register' && methodUpper === 'POST') {
            return success({ user: MOCK_USER, token: MOCK_USER.token });
        }

        // --- Item Routes ---
        if (url === '/items' && methodUpper === 'GET') {
            // Filter logic
            let items = [...MOCK_ITEMS];
            if (params?.sellerId) {
                items = items.filter(i => i.sellerId === params.sellerId);
            }
            if (params?.status) {
                items = items.filter(i => i.status === params.status);
            }
            return success({
                items,
                total: items.length,
                page: params?.page || 1,
                totalPages: 1
            });
        }

        if (url?.match(/\/items\/[\w-]+$/) && methodUpper === 'GET') {
            const id = url.split('/').pop();
            const item = MOCK_ITEMS.find(i => i.id === id);
            if (item) return success(item);
            return error(404, 'Item not found');
        }

        if (url === '/items' && methodUpper === 'POST') {
            const body = JSON.parse(data);
            const newItem = {
                ...body,
                id: `item-${Date.now()}`,
                sellerId: MOCK_USER.id,
                sellerName: MOCK_USER.name,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            MOCK_ITEMS.unshift(newItem);
            return success(newItem);
        }

        if (url?.match(/\/items\/[\w-]+$/) && methodUpper === 'PATCH') {
            const id = url.split('/').pop();
            const body = JSON.parse(data);
            const index = MOCK_ITEMS.findIndex(i => i.id === id);
            if (index !== -1) {
                MOCK_ITEMS[index] = { ...MOCK_ITEMS[index], ...body };
                return success(MOCK_ITEMS[index]);
            }
            return error(404, 'Item not found');
        }

        if (url?.match(/\/items\/[\w-]+$/) && methodUpper === 'DELETE') {
            const id = url.split('/').pop();
            const index = MOCK_ITEMS.findIndex(i => i.id === id);
            if (index !== -1) {
                MOCK_ITEMS.splice(index, 1);
                return success({ success: true });
            }
            return error(404, 'Item not found');
        }

        // --- Demand Routes ---
        if (url === '/demands' && methodUpper === 'GET') {
            let demands = [...MOCK_DEMANDS];
            if (params?.requesterId) {
                demands = demands.filter(d => d.requesterId === params.requesterId);
            }
            if (params?.status) {
                demands = demands.filter(d => d.status === params.status);
            }
            return success({
                demands,
                total: demands.length,
                page: params?.page || 1,
                totalPages: 1
            });
        }

        if (url?.match(/\/demands\/[\w-]+$/) && methodUpper === 'GET') {
            const id = url.split('/').pop();
            const demand = MOCK_DEMANDS.find(d => d.id === id);
            if (demand) return success(demand);
            return error(404, 'Demand not found');
        }

        if (url === '/demands' && methodUpper === 'POST') {
            const body = JSON.parse(data);
            const newDemand = {
                ...body,
                id: `demand-${Date.now()}`,
                requesterId: MOCK_USER.id,
                requesterName: MOCK_USER.name,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            MOCK_DEMANDS.unshift(newDemand);
            return success(newDemand);
        }

        // --- Comments Routes ---
        if (url === '/comments' && methodUpper === 'GET') {
            let comments = [...MOCK_COMMENTS];
            if (params?.targetId) {
                comments = comments.filter(c => c.targetId === params.targetId);
            }
            if (params?.targetType) {
                comments = comments.filter(c => c.targetType === params.targetType);
            }
            return success({
                comments,
                total: comments.length,
                page: params?.page || 1,
                totalPages: 1
            });
        }

        if (url === '/comments' && methodUpper === 'POST') {
            const body = JSON.parse(data);
            const newComment = {
                ...body,
                id: `comment-${Date.now()}`,
                authorId: MOCK_USER.id,
                authorName: MOCK_USER.name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            MOCK_COMMENTS.unshift(newComment);
            return success(newComment);
        }

        // --- Offers (Simple Success) ---
        if (url?.includes('/offers')) {
            return success({ success: true });
        }

        // Fallback to original adapter (which will likely fail if no backend)
        // or just return 404
        if (originalAdapter) {
            // return originalAdapter(config);
        }
        return error(404, `Mock route not found: ${methodUpper} ${url}`);
    };
}
