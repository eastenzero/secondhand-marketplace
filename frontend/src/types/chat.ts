export interface Message {
    id: string;
    threadId: string;
    senderId: string;
    recipientId: string;
    content: string;
    isRead: boolean;
    status: 'active' | 'recalled' | 'deleted';
    createdAt: string;
}

export interface ChatThread {
    id: string;
    targetType: 'item' | 'demand' | 'order' | 'system';
    targetId: string;
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;
    // Frontend helper fields (might not be in backend response yet)
    otherUser: {
        id: string;
        name: string;
        avatar?: string;
    };
}

export interface CreateThreadDTO {
    targetType: 'item' | 'demand' | 'order';
    targetId: string;
    recipientId: string;
    content: string; // First message content
}

export interface MessagesResponse {
    messages: Message[];
    total: number;
    page: number;
    totalPages: number;
}
