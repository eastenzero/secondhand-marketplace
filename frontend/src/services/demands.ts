import { api } from './api';
import { Demand, GetDemandsParams, DemandsResponse, CreateDemandDTO, UpdateDemandDTO } from '@/types/demand';

export const demandsService = {
    getDemands: async (params?: GetDemandsParams) => {
        const response = await api.get<DemandsResponse>('/demands', { params });
        return response.data;
    },

    getDemand: async (id: string) => {
        const response = await api.get<Demand>(`/demands/${id}`);
        return response.data;
    },

    createDemand: async (data: CreateDemandDTO) => {
        const response = await api.post<Demand>('/demands', data);
        return response.data;
    },

    updateDemand: async (id: string, data: UpdateDemandDTO) => {
        const response = await api.patch<Demand>(`/demands/${id}`, data);
        return response.data;
    },

    deleteDemand: async (id: string) => {
        await api.delete(`/demands/${id}`);
    },
};
