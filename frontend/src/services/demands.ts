import { api } from './api';
import {
    Demand,
    GetDemandsParams,
    DemandsResponse,
    CreateDemandDTO,
    UpdateDemandDTO,
    DemandStatus,
} from '@/types/demand';

interface BackendDemandSearchResultItem {
    demandId: number;
    title: string;
    expectedPrice: number;
    status: string;
}

interface BackendDemandSearchResponse {
    total: number;
    demands: BackendDemandSearchResultItem[];
}

interface BackendDemandDetailResponse {
    demandId: number;
    buyerId: number;
    title: string;
    desc?: string;
    category?: string;
    expectedPrice: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface BackendCreateDemandResponse {
    demandId: number;
    status: string;
}

export const demandsService = {
    getDemands: async (params?: GetDemandsParams): Promise<DemandsResponse> => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 12;

        const response = await api.get<BackendDemandSearchResponse>('/demands', {
            params: {
                keywords: params?.keyword,
                category: params?.category,
                minPrice: params?.minPrice,
                maxPrice: params?.maxPrice,
                page,
                size: limit,
            },
        });

        const demands: Demand[] = response.data.demands.map((d) => ({
            id: String(d.demandId),
            title: d.title,
            description: '',
            minPrice: Number(d.expectedPrice),
            maxPrice: Number(d.expectedPrice),
            status: d.status as DemandStatus,
            requesterId: '',
            requesterName: undefined,
            imageUrl: undefined,
            images: [],
            category: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));

        return {
            demands,
            total: response.data.total,
            page,
            totalPages: Math.max(1, Math.ceil(response.data.total / limit)),
        };
    },

    getDemand: async (id: string): Promise<Demand> => {
        const response = await api.get<BackendDemandDetailResponse>(`/demands/${id}`);
        const d = response.data;

        const createdAt =
            typeof d.createdAt === 'string'
                ? d.createdAt
                : new Date(d.createdAt as any).toISOString();
        const updatedAt =
            typeof d.updatedAt === 'string'
                ? d.updatedAt
                : new Date(d.updatedAt as any).toISOString();

        const expected = Number(d.expectedPrice);

        const demand: Demand = {
            id: String(d.demandId),
            title: d.title,
            description: d.desc ?? '',
            minPrice: expected,
            maxPrice: expected,
            status: d.status as DemandStatus,
            requesterId: String(d.buyerId),
            requesterName: undefined,
            imageUrl: undefined,
            images: [],
            category: d.category ?? undefined,
            createdAt,
            updatedAt,
        };

        return demand;
    },

    createDemand: async (data: CreateDemandDTO): Promise<Demand> => {
        const expectedPrice =
            data.maxPrice !== undefined
                ? data.maxPrice
                : data.minPrice !== undefined
                ? data.minPrice
                : 0.01;

        const payload = {
            title: data.title,
            desc: data.description,
            category: data.category,
            expectedPrice,
        };

        const response = await api.post<BackendCreateDemandResponse>('/demands', payload);
        const newId = String(response.data.demandId);
        return demandsService.getDemand(newId);
    },

    updateDemand: async (id: string, data: UpdateDemandDTO): Promise<Demand> => {
        const payload: any = {};

        if (data.title !== undefined) payload.title = data.title;
        if (data.description !== undefined) payload.desc = data.description;
        if (data.category !== undefined) payload.category = data.category;
        if (data.maxPrice !== undefined) payload.expectedPrice = data.maxPrice;

        const body = {
            action: 'update',
            payload,
        };

        await api.patch(`/demands/${id}`, body);
        return demandsService.getDemand(id);
    },

    deleteDemand: async (id: string): Promise<void> => {
        await api.patch(`/demands/${id}`, { action: 'off' });
    },
};