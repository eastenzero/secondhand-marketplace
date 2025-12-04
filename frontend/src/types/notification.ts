export interface Notification {
    id: string;
    userId: string;
    type: 'system' | 'comment' | 'offer' | 'order' | 'review';
    title: string;
    content: string;
    relatedType?: string;
    relatedId?: string;
    isRead: boolean;
    status: 'active' | 'archived' | 'deleted';
    createdAt: string;
    readAt?: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
}
