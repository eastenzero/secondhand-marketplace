import { DemandStatus } from './enums';

export { DemandStatus };

export interface Demand {
    id: string;
    title: string;
    description: string;
    minPrice: number;
    maxPrice: number;
    status: DemandStatus;
    requesterId: string;
    requesterName?: string;
    imageUrl?: string;
    images?: string[];
    category?: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetDemandsParams {
    page?: number;
    limit?: number;
    keyword?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: DemandStatus;
    requesterId?: string;
}

export interface DemandsResponse {
    demands: Demand[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CreateDemandDTO {
    title: string;
    description: string;
    minPrice: number;
    maxPrice: number;
    category?: string;
    images?: string[];
}

export interface UpdateDemandDTO extends Partial<CreateDemandDTO> {
    status?: DemandStatus;
}
