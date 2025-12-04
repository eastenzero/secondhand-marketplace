import { api } from './api';
import { Order, CreateOrderDTO, OrdersResponse, OrderStatus } from '@/types/order';

// Mock data for order list (since backend might not have list endpoint yet)
const MOCK_ORDERS: Order[] = [
    {
        id: 'mock-order-1',
        buyerId: 'me',
        sellerId: 'user1',
        sellerName: 'Alice',
        offerId: 'offer-1',
        totalAmount: 5000,
        status: OrderStatus.CREATED,
        items: [
            {
                id: 'item-1',
                targetType: 'item',
                targetId: '1',
                targetTitle: 'iPhone 15',
                price: 5000,
                quantity: 1
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

interface BackendOrder {
    id: number;
    buyerId: number;
    sellerId: number;
    offerId: number;
    totalAmount: number;
    status: string;
    items: any[]; // Adjust based on actual backend response
    createdAt: string;
    updatedAt: string;
}

interface BackendOrderResponse {
    orderId: number;
    status: string;
    // ... other fields
}

export const ordersService = {
    // Real API: Create order from offer
    createOrder: async (data: CreateOrderDTO): Promise<string> => {
        const response = await api.post<BackendOrderResponse>('/orders', {
            offerId: Number(data.offerId),
            shippingAddress: data.shippingAddress,
            paymentMethod: data.paymentMethod
        });
        // Backend returns the full order object or just ID? 
        // Based on doc: createOrderFromOffer returns Order
        // Let's assume response.data has id or orderId
        return String((response.data as any).id || (response.data as any).orderId);
    },

    // Real API: Get order detail
    getOrder: async (id: string): Promise<Order> => {
        if (id.startsWith('mock-')) {
            return MOCK_ORDERS.find(o => o.id === id) || MOCK_ORDERS[0];
        }

        const response = await api.get<BackendOrder>(`/orders/${id}`);
        const d = response.data;

        return {
            id: String(d.id),
            buyerId: String(d.buyerId),
            sellerId: String(d.sellerId),
            offerId: String(d.offerId),
            totalAmount: Number(d.totalAmount),
            status: d.status as any,
            items: (d.items || []).map((item: any) => ({
                id: String(item.id || '0'),
                targetType: item.targetType || 'item',
                targetId: String(item.targetId),
                targetTitle: item.targetTitle || 'Item', // Backend might not return title in item list yet
                price: Number(item.price),
                quantity: Number(item.quantity || 1)
            })),
            createdAt: d.createdAt,
            updatedAt: d.updatedAt
        };
    },

    // Mock API: Get orders list (Backend TODO)
    getOrders: async (role: 'buyer' | 'seller' = 'buyer'): Promise<OrdersResponse> => {
        // TODO: Replace with real API GET /api/orders?role=...
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    orders: MOCK_ORDERS,
                    total: MOCK_ORDERS.length,
                    page: 1,
                    totalPages: 1
                });
            }, 500);
        });
    },

    // Real API: Update order status
    updateOrder: async (id: string, action: 'pay' | 'cancel' | 'complete'): Promise<void> => {
        if (id.startsWith('mock-')) {
            // Update mock data locally
            const order = MOCK_ORDERS.find(o => o.id === id);
            if (order) {
                if (action === 'pay') order.status = OrderStatus.PAID;
                if (action === 'cancel') order.status = OrderStatus.CANCELED;
                if (action === 'complete') order.status = OrderStatus.COMPLETED;
            }
            return;
        }
        await api.patch(`/orders/${id}?action=${action}`);
    }
};
