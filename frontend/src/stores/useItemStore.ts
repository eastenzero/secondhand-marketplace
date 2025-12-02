import { create } from 'zustand';
import { Item, GetItemsParams, CreateItemDTO, UpdateItemDTO } from '@/types/item';
import { itemsService } from '@/services/items';

interface ItemState {
    items: Item[];
    total: number;
    isLoading: boolean;
    error: string | null;
    itemDetails: Record<string, Item>; // Cache for details

    fetchItems: (params?: GetItemsParams) => Promise<void>;
    fetchItem: (id: string) => Promise<Item | null>;
    createItem: (data: any) => Promise<Item | null>;
    updateItem: (id: string, data: any) => Promise<Item | null>;
    deleteItem: (id: string) => Promise<boolean>;
    clearError: () => void;
}

export const useItemStore = create<ItemState>((set, get) => ({
    items: [],
    total: 0,
    isLoading: false,
    error: null,
    itemDetails: {},

    fetchItems: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const data = await itemsService.getItems(params);
            set({ items: data.items, total: data.total, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to fetch items' });
        }
    },

    fetchItem: async (id) => {
        // Check cache first (optional optimization, but good for UX)
        const cached = get().itemDetails[id];
        if (cached) return cached;

        set({ isLoading: true, error: null });
        try {
            const item = await itemsService.getItem(id);
            set((state) => ({
                itemDetails: { ...state.itemDetails, [id]: item },
                isLoading: false,
            }));
            return item;
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to fetch item details' });
            return null;
        }
    },

    createItem: async (data: CreateItemDTO) => {
        set({ isLoading: true, error: null });
        try {
            const newItem = await itemsService.createItem(data);
            // Invalidate list cache so next fetch gets new data
            // We could also optimistically add to list, but invalidation is safer for pagination
            set({ items: [], total: 0, isLoading: false });
            return newItem;
        } catch (error) {
            const err = error as any;
            set({ isLoading: false, error: err.message || 'Failed to create item' });
            return null;
        }
    },

    updateItem: async (id, data: UpdateItemDTO) => {
        set({ isLoading: true, error: null });
        try {
            const updatedItem = await itemsService.updateItem(id, data);
            set((state) => ({
                items: state.items.map((i) => (i.id === id ? updatedItem : i)),
                itemDetails: { ...state.itemDetails, [id]: updatedItem },
                isLoading: false,
            }));
            return updatedItem;
        } catch (error) {
            const err = error as any;
            set({ isLoading: false, error: err.message || 'Failed to update item' });
            return null;
        }
    },

    deleteItem: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await itemsService.deleteItem(id);
            set((state) => ({
                items: state.items.filter((i) => i.id !== id),
                total: state.total - 1,
                isLoading: false,
            }));
            // Remove from details cache
            const newDetails = { ...get().itemDetails };
            delete newDetails[id];
            set({ itemDetails: newDetails });
            return true;
        } catch (error) {
            const err = error as any;
            set({ isLoading: false, error: err.message || 'Failed to delete item' });
            return false;
        }
    },

    clearError: () => set({ error: null }),
}));
