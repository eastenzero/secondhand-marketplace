import { api } from './api';

export interface ImageStyleResponse {
    style: 'cartoon' | 'photo';
}

export const systemService = {
    getImageStyle: async (): Promise<ImageStyleResponse> => {
        const response = await api.get<ImageStyleResponse>('/system/image-style');
        return response.data;
    },

    setImageStyle: async (style: 'cartoon' | 'photo'): Promise<ImageStyleResponse> => {
        const response = await api.put<ImageStyleResponse>('/system/image-style', { style });
        return response.data;
    },
};
