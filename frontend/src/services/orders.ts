import { api } from './api';
import { Order, OrderItem, CreateOrderDTO, OrdersResponse, OrderStatus } from '@/types/order';

interface BackendOrderItemSummary {
	orderItemId: number;
	targetType: string;
	targetId: number;
	quantity: number;
	price: number;
}

interface BackendOrderDetailResponse {
	orderId: number;
	buyerId: number;
	sellerId: number;
	offerId: number;
	totalAmount: number;
	status: string;
	shippingName: string;
	shippingPhone: string;
	shippingAddress: string;
	paymentMethod: string;
	createdAt: string;
	updatedAt: string;
	items: BackendOrderItemSummary[];
}

interface BackendOrderListItem {
	orderId: number;
	buyerId: number;
	sellerId: number;
	offerId: number;
	totalAmount: number;
	status: string;
	shippingAddress: string;
	paymentMethod: string;
	createdAt: string;
	updatedAt: string;
	items: BackendOrderItemSummary[];
}

interface BackendOrderListResponse {
	total: number;
	orders: BackendOrderListItem[];
}

interface BackendCreateOrderResponse {
	orderId: number;
	status: string;
}

export const ordersService = {
	// Real API: Create order from offer
	createOrder: async (data: CreateOrderDTO): Promise<string> => {
		const response = await api.post<BackendCreateOrderResponse>('/orders', {
			offerId: Number(data.offerId),
			shippingAddress: data.shippingAddress,
			paymentMethod: data.paymentMethod
		});
		return String(response.data.orderId);
	},

	// Real API: Get order detail
	getOrder: async (id: string): Promise<Order> => {
		const response = await api.get<BackendOrderDetailResponse>(`/orders/${id}`);
		const d = response.data;

		const items: OrderItem[] = (d.items || []).map((item) => ({
			id: String(item.orderItemId),
			targetType: (item.targetType as 'item' | 'demand') || 'item',
			targetId: String(item.targetId),
			targetTitle: '商品',
			price: Number(item.price),
			quantity: Number(item.quantity ?? 1),
		}));

		return {
			id: String(d.orderId),
			buyerId: String(d.buyerId),
			sellerId: String(d.sellerId),
			offerId: String(d.offerId),
			totalAmount: Number(d.totalAmount),
			status: d.status as OrderStatus,
			items,
			createdAt: new Date(d.createdAt as any).toISOString(),
			updatedAt: new Date(d.updatedAt as any).toISOString(),
			paymentMethod: d.paymentMethod || undefined,
			shippingAddress: d.shippingAddress || undefined,
		};
	},

	// Real API: Get orders list
	getOrders: async (role: 'buyer' | 'seller' = 'buyer'): Promise<OrdersResponse> => {
		const response = await api.get<BackendOrderListResponse>('/orders', {
			params: { role },
		});
		const data = response.data;

		const orders: Order[] = data.orders.map((d) => {
			const items: OrderItem[] = (d.items || []).map((item) => ({
				id: String(item.orderItemId),
				targetType: (item.targetType as 'item' | 'demand') || 'item',
				targetId: String(item.targetId),
				targetTitle: '商品',
				price: Number(item.price),
				quantity: Number(item.quantity ?? 1),
			}));

			return {
				id: String(d.orderId),
				buyerId: String(d.buyerId),
				sellerId: String(d.sellerId),
				offerId: String(d.offerId),
				totalAmount: Number(d.totalAmount),
				status: d.status as OrderStatus,
				items,
				createdAt: new Date(d.createdAt as any).toISOString(),
				updatedAt: new Date(d.updatedAt as any).toISOString(),
				paymentMethod: d.paymentMethod || undefined,
				shippingAddress: d.shippingAddress || undefined,
			};
		});

		return {
			orders,
			total: data.total,
			page: 1,
			totalPages: 1,
		};
	},

	// Real API: Update order status
	updateOrder: async (id: string, action: 'pay' | 'cancel' | 'complete'): Promise<void> => {
		await api.patch(`/orders/${id}?action=${action}`);
	}
};
