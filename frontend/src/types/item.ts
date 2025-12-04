import { ItemStatus } from './enums';

export { ItemStatus };

export interface Item {
    id: string;
    title: string;
    description: string;
    price: number;
    status: ItemStatus;
    sellerId: string;
    sellerName?: string; // Optional, might come from join
    imageUrl?: string; // Optional image
    images?: string[];
    category?: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetItemsParams {
    page?: number;
    limit?: number;
    keyword?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: ItemStatus;
    sellerId?: string;
}

export interface ItemsResponse {
    items: Item[];
    total: number;
    page: number;
    totalPages: number;
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
