import { OrderStatus } from './enums';

export { OrderStatus };

export interface OrderItem {
    id: string;
    targetType: 'item' | 'demand';
    targetId: string;
    targetTitle: string;
    targetImage?: string;
    price: number;
    quantity: number;
}

export interface Order {
    id: string;
    buyerId: string;
    buyerName?: string;
    sellerId: string;
    sellerName?: string;
    offerId: string;
    totalAmount: number;
    status: OrderStatus;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
    // Payment info placeholders
    paymentMethod?: string;
    shippingAddress?: string;
}

export interface CreateOrderDTO {
    offerId: string;
    shippingAddress?: string;
    paymentMethod?: string;
}

export interface OrdersResponse {
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
}
