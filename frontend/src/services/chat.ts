import { api } from './api';
import { ChatThread, Message, MessagesResponse, CreateThreadDTO } from '@/types/chat';

// Mock data for threads list (since backend API is missing)
const MOCK_THREADS: ChatThread[] = [
    {
        id: 'mock-1',
        targetType: 'item',
        targetId: '1',
        unreadCount: 2,
        updatedAt: new Date().toISOString(),
        otherUser: { id: 'user1', name: 'Alice' },
        lastMessage: {
            id: 'm1',
            threadId: 'mock-1',
            senderId: 'user1',
            recipientId: 'me',
            content: '这个价格可以再便宜点吗？',
            isRead: false,
            status: 'active',
            createdAt: new Date().toISOString(),
        }
    },
    {
        id: 'mock-2',
        targetType: 'item',
        targetId: '2',
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
        otherUser: { id: 'user2', name: 'Bob' },
        lastMessage: {
            id: 'm2',
            threadId: 'mock-2',
            senderId: 'me',
            recipientId: 'user2',
            content: '好的，下午见。',
            isRead: true,
            status: 'active',
            createdAt: new Date().toISOString(),
        }
    }
];

interface BackendCreateThreadResponse {
    threadId: number;
}

interface BackendMessage {
    id: number;
    threadId: number;
    senderUserId: number;
    recipientUserId: number;
    content: string;
    isRead: boolean;
    status: string;
    createdAt: string;
}

interface BackendMessageListResponse {
    total: number;
    messages: BackendMessage[];
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
        // If it's a mock ID, return mock messages to avoid 404/500
        if (threadId.startsWith('mock-')) {
            return {
                messages: [],
                total: 0,
                page: 1,
                totalPages: 1
            };
        }

        const response = await api.get<BackendMessageListResponse>(`/threads/${threadId}/messages`, {
            params: { page, size }
        });

        const messages: Message[] = response.data.messages.map(m => ({
            id: String(m.id),
            threadId: String(m.threadId),
            senderId: String(m.senderUserId),
            recipientId: String(m.recipientUserId),
            content: m.content,
            isRead: m.isRead,
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

    // Mock API: Get threads list
    getThreads: async (): Promise<ChatThread[]> => {
        // TODO: Replace with real API GET /api/threads when available
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_THREADS), 500);
        });
    },

    // Mock API: Send reply
    sendMessage: async (threadId: string, content: string): Promise<Message> => {
        // TODO: Replace with real API POST /api/threads/{id}/messages when available
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: 'temp-' + Date.now(),
                    threadId,
                    senderId: 'me', // Should be current user ID
                    recipientId: 'other', // Unknown in this context
                    content,
                    isRead: false,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                });
            }, 300);
        });
    }
};
