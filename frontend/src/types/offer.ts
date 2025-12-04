import { OfferStatus } from './enums';

export type TargetType = 'item' | 'demand';
export { OfferStatus };

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
