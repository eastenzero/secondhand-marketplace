import { api } from './api';
import { Notification, NotificationsResponse } from '@/types/notification';

interface BackendNotification {
    id: number;
    userId: number;
    type: string;
    title: string;
    content: string;
    relatedType?: string;
    relatedId?: string;
    isRead: boolean;
    status: string;
    createdAt: string;
    readAt?: string;
}

interface BackendNotificationResponse {
    total: number;
    notifications: BackendNotification[];
}

export const notificationsService = {
    getNotifications: async (page = 1, size = 20): Promise<NotificationsResponse> => {
        const response = await api.get<BackendNotificationResponse>('/notifications/me', {
            params: {
                page,
                size,
            },
        });

        const notifications: Notification[] = response.data.notifications.map((n) => ({
            id: String(n.id),
            userId: String(n.userId),
            type: n.type as any,
            title: n.title,
            content: n.content,
            relatedType: n.relatedType,
            relatedId: n.relatedId ? String(n.relatedId) : undefined,
            isRead: n.isRead,
            status: n.status as any,
            createdAt: n.createdAt,
            readAt: n.readAt,
        }));

        return {
            notifications,
            total: response.data.total,
            page,
            totalPages: Math.max(1, Math.ceil(response.data.total / size)),
        };
    },

    markAsRead: async (id: string): Promise<void> => {
        await api.patch(`/notifications/${id}/read`);
    },
};
