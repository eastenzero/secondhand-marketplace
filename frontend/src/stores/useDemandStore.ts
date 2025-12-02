import { create } from 'zustand';
import { Demand, GetDemandsParams, CreateDemandDTO, UpdateDemandDTO } from '@/types/demand';
import { demandsService } from '@/services/demands';

interface DemandState {
    demands: Demand[];
    total: number;
    isLoading: boolean;
    error: string | null;
    demandDetails: Record<string, Demand>; // Cache for details

    fetchDemands: (params?: GetDemandsParams) => Promise<void>;
    fetchDemand: (id: string) => Promise<Demand | null>;
    createDemand: (data: any) => Promise<Demand | null>;
    updateDemand: (id: string, data: any) => Promise<Demand | null>;
    deleteDemand: (id: string) => Promise<boolean>;
    clearError: () => void;
}

export const useDemandStore = create<DemandState>((set, get) => ({
    demands: [],
    total: 0,
    isLoading: false,
    error: null,
    demandDetails: {},

    fetchDemands: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const data = await demandsService.getDemands(params);
            set({ demands: data.demands, total: data.total, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to fetch demands' });
        }
    },

    fetchDemand: async (id) => {
        const cached = get().demandDetails[id];
        if (cached) return cached;

        set({ isLoading: true, error: null });
        try {
            const demand = await demandsService.getDemand(id);
            set((state) => ({
                demandDetails: { ...state.demandDetails, [id]: demand },
                isLoading: false,
            }));
            return demand;
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to fetch demand details' });
            return null;
        }
    },

    createDemand: async (data: CreateDemandDTO) => {
        set({ isLoading: true, error: null });
        try {
            const newDemand = await demandsService.createDemand(data);
            set({ demands: [], total: 0, isLoading: false });
            return newDemand;
        } catch (error) {
            const err = error as any;
            set({ isLoading: false, error: err.message || 'Failed to create demand' });
            return null;
        }
    },

    updateDemand: async (id, data: UpdateDemandDTO) => {
        set({ isLoading: true, error: null });
        try {
            const updatedDemand = await demandsService.updateDemand(id, data);
            set((state) => ({
                demands: state.demands.map((d) => (d.id === id ? updatedDemand : d)),
                demandDetails: { ...state.demandDetails, [id]: updatedDemand },
                isLoading: false,
            }));
            return updatedDemand;
        } catch (error) {
            const err = error as any;
            set({ isLoading: false, error: err.message || 'Failed to update demand' });
            return null;
        }
    },

    deleteDemand: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await demandsService.deleteDemand(id);
            set((state) => ({
                demands: state.demands.filter((d) => d.id !== id),
                total: state.total - 1,
                isLoading: false,
            }));
            const newDetails = { ...get().demandDetails };
            delete newDetails[id];
            set({ demandDetails: newDetails });
            return true;
        } catch (error) {
            const err = error as any;
            set({ isLoading: false, error: err.message || 'Failed to delete demand' });
            return false;
        }
    },

    clearError: () => set({ error: null }),
}));
