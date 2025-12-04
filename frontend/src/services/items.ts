import { api } from './api';
import { Item, GetItemsParams, ItemsResponse, ItemStatus } from '@/types/item';

interface BackendItemSearchResultItem {
    itemId: number;
    title: string;
    price: number;
    status: string;
}

interface BackendItemSearchResponse {
    total: number;
    items: BackendItemSearchResultItem[];
}

interface BackendItemDetailResponse {
    itemId: number;
    sellerId: number;
    title: string;
    desc?: string;
    category?: string;
    price: number;
    condition?: string;
    status: string;
    images?: string[];
    createdAt: string;
    updatedAt: string;
}

interface BackendCreateItemResponse {
    itemId: number;
    status: string;
}

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
    getItems: async (params?: GetItemsParams): Promise<ItemsResponse> => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 12;

        const response = await api.get<BackendItemSearchResponse>('/items', {
            params: {
                keywords: params?.keyword,
                category: params?.category,
                minPrice: params?.minPrice,
                maxPrice: params?.maxPrice,
                page,
                size: limit,
            },
        });

        const items: Item[] = response.data.items.map((it) => ({
            id: String(it.itemId),
            title: it.title,
            description: '',
            price: Number(it.price),
            status: it.status as ItemStatus,
            sellerId: '',
            sellerName: undefined,
            imageUrl: undefined,
            images: [],
            category: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));

        return {
            items,
            total: response.data.total,
            page,
            totalPages: Math.max(1, Math.ceil(response.data.total / limit)),
        };
    },

    getItem: async (id: string): Promise<Item> => {
        const response = await api.get<BackendItemDetailResponse>(`/items/${id}`);
        const d = response.data;

        const createdAt =
            typeof d.createdAt === 'string'
                ? d.createdAt
                : new Date(d.createdAt as any).toISOString();
        const updatedAt =
            typeof d.updatedAt === 'string'
                ? d.updatedAt
                : new Date(d.updatedAt as any).toISOString();

        const item: Item = {
            id: String(d.itemId),
            title: d.title,
            description: d.desc ?? '',
            price: Number(d.price),
            status: d.status as ItemStatus,
            sellerId: String(d.sellerId),
            sellerName: undefined,
            imageUrl: d.images && d.images.length > 0 ? d.images[0] : undefined,
            images: d.images ?? [],
            category: d.category ?? undefined,
            createdAt,
            updatedAt,
        };

        return item;
    },

    createItem: async (data: CreateItemDTO): Promise<Item> => {
        const payload = {
            title: data.title,
            desc: data.description,
            category: data.category,
            price: data.price,
            images: data.images,
        };

        const response = await api.post<BackendCreateItemResponse>('/items', payload);
        const newId = String(response.data.itemId);
        return itemsService.getItem(newId);
    },

    updateItem: async (id: string, data: UpdateItemDTO): Promise<Item> => {
        const payload: any = {};

        if (data.title !== undefined) payload.title = data.title;
        if (data.description !== undefined) payload.desc = data.description;
        if (data.category !== undefined) payload.category = data.category;
        if (data.price !== undefined) payload.price = data.price;
        if (data.images !== undefined) payload.images = data.images;

        const body = {
            action: 'update',
            payload,
        };

        await api.patch(`/items/${id}`, body);
        return itemsService.getItem(id);
    },

    deleteItem: async (id: string): Promise<void> => {
        await api.patch(`/items/${id}`, { action: 'off' });
    },
};