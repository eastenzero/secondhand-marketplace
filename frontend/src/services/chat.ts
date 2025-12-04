import { api } from './api';
import { ChatThread, Message, MessagesResponse, CreateThreadDTO } from '@/types/chat';

interface BackendCreateThreadResponse {
    threadId: number;
}

interface BackendMessageItem {
    messageId: number;
    senderUserId: number;
    recipientUserId: number;
    content: string;
    read: boolean;
    createdAt: string;
    status: string;
}

interface BackendMessageListResponse {
    total: number;
    messages: BackendMessageItem[];
}

interface BackendThreadListItem {
    threadId: number;
    targetType: string;
    targetId: number | null;
    otherUserId: number | null;
    otherUsername: string | null;
    lastMessageId: number | null;
    lastMessageContent: string | null;
    lastMessageSenderUserId: number | null;
    lastMessageStatus: string | null;
    lastMessageCreatedAt: string | null;
    unreadCount: number;
    hasUnread: boolean;
}

interface BackendThreadListResponse {
    total: number;
    threads: BackendThreadListItem[];
}

export const chatService = {
    // Real API: Create thread with first message
    createThread: async (data: CreateThreadDTO): Promise<string> => {
        const response = await api.post<BackendCreateThreadResponse>('/threads', {
            targetType: data.targetType,
            targetId: Number(data.targetId),
            recipientUserId: Number(data.recipientId),
            content: data.content,
        });
        return String(response.data.threadId);
    },

    // Real API: Get messages for a thread
    getMessages: async (threadId: string, page = 1, size = 20): Promise<MessagesResponse> => {
        const response = await api.get<BackendMessageListResponse>(`/threads/${threadId}/messages`, {
            params: { page, size }
        });

        const messages: Message[] = response.data.messages.map(m => ({
            id: String(m.messageId),
            threadId: String(threadId),
            senderId: String(m.senderUserId),
            recipientId: String(m.recipientUserId),
            content: m.content,
            isRead: m.read,
            status: m.status as any,
            createdAt: m.createdAt,
        }));

        return {
            messages,
            total: response.data.total,
            page,
            totalPages: Math.max(1, Math.ceil(response.data.total / size)),
        };
    },

    // Real API: Get threads list
    getThreads: async (): Promise<ChatThread[]> => {
        const response = await api.get<BackendThreadListResponse>('/threads', {
            params: { page: 1, size: 50 },
        });
        const data = response.data;

        const threads: ChatThread[] = data.threads.map(t => {
            const id = String(t.threadId);
            const updatedAt = t.lastMessageCreatedAt ?? new Date().toISOString();
            const otherName = t.otherUsername ?? '未知用户';
            const otherId = t.otherUserId != null ? String(t.otherUserId) : 'unknown';

            let lastMessage: Message | undefined;
            if (t.lastMessageId != null) {
                lastMessage = {
                    id: String(t.lastMessageId),
                    threadId: id,
                    senderId: t.lastMessageSenderUserId != null ? String(t.lastMessageSenderUserId) : otherId,
                    recipientId: otherId,
                    content: t.lastMessageContent ?? '',
                    isRead: !t.hasUnread,
                    status: (t.lastMessageStatus as any) || 'active',
                    createdAt: t.lastMessageCreatedAt ?? updatedAt,
                };
            }

            return {
                id,
                targetType: (t.targetType as any) || 'system',
                targetId: String(t.targetId ?? '0'),
                unreadCount: t.unreadCount,
                updatedAt,
                otherUser: {
                    id: otherId,
                    name: otherName,
                },
                lastMessage,
            };
        });

        return threads;
    },

    // Real API: Send reply
    sendMessage: async (threadId: string, content: string): Promise<Message> => {
        const response = await api.post<BackendMessageItem>(`/threads/${threadId}/messages`, {
            content,
        });
        const m = response.data;
        return {
            id: String(m.messageId),
            threadId,
            senderId: String(m.senderUserId),
            recipientId: String(m.recipientUserId),
            content: m.content,
            isRead: m.read,
            status: m.status as any,
            createdAt: m.createdAt,
        };
    }
};
