import { api } from './api';
import { Offer, CreateOfferDTO } from '@/types/offer';

export const offersService = {
    createOffer: async (data: CreateOfferDTO) => {
        const response = await api.post<Offer>('/offers', data);
        return response.data;
    },

    // Future: getOffersByTarget, getMyOffers, etc.
};
