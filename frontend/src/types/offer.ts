export type TargetType = 'item' | 'demand';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface Offer {
    id: string;
    targetType: TargetType;
    targetId: string;
    offererId: string;
    offererName?: string;
    amount: number;
    message?: string;
    status: OfferStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOfferDTO {
    targetType: TargetType;
    targetId: string;
    amount: number;
    message?: string;
}
