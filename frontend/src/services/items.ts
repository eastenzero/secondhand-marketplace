import { api } from './api';
import { Item, GetItemsParams, ItemsResponse, ItemStatus } from '@/types/item';

export interface CreateItemDTO {
    title: string;
    description: string;
    price: number;
    category?: string;
    images?: string[];
}

export interface UpdateItemDTO extends Partial<CreateItemDTO> {
    status?: ItemStatus;
}

export const itemsService = {
    getItems: async (params?: GetItemsParams) => {
        const response = await api.get<ItemsResponse>('/items', { params });
        return response.data;
    },

    getItem: async (id: string) => {
        const response = await api.get<Item>(`/items/${id}`);
        return response.data;
    },

    createItem: async (data: CreateItemDTO) => {
        const response = await api.post<Item>('/items', data);
        return response.data;
    },

    updateItem: async (id: string, data: UpdateItemDTO) => {
        const response = await api.patch<Item>(`/items/${id}`, data);
        return response.data;
    },

    deleteItem: async (id: string) => {
        await api.delete(`/items/${id}`);
    },
};
