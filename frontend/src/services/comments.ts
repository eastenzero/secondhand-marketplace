import { api } from './api';
import { Comment, GetCommentsParams, CommentsResponse, CreateCommentDTO } from '@/types/comment';

interface BackendCommentListItem {
    commentId: number;
    userId: number;
    content: string;
    createdAt: string;
}

interface BackendCommentListResponse {
    total: number;
    comments: BackendCommentListItem[];
}

interface BackendCreateCommentResponse {
    commentId: number;
}

export const commentsService = {
    getComments: async (params: GetCommentsParams): Promise<CommentsResponse> => {
        const page = params.page ?? 1;
        const limit = params.limit ?? 5;

        const response = await api.get<BackendCommentListResponse>('/comments', {
            params: {
                targetType: params.targetType,
                targetId: Number(params.targetId),
                page,
                size: limit,
            },
        });

        const comments: Comment[] = response.data.comments.map((c) => {
            const createdAt =
                typeof c.createdAt === 'string'
                    ? c.createdAt
                    : new Date(c.createdAt as any).toISOString();

            return {
                id: String(c.commentId),
                targetType: params.targetType,
                targetId: params.targetId,
                authorId: String(c.userId),
                authorName: undefined,
                content: c.content,
                createdAt,
                updatedAt: createdAt,
            };
        });

        return {
            comments,
            total: response.data.total,
            page,
            totalPages: Math.max(1, Math.ceil(response.data.total / limit)),
        };
    },

    createComment: async (data: CreateCommentDTO): Promise<Comment> => {
        const payload = {
            targetType: data.targetType,
            targetId: Number(data.targetId),
            content: data.content,
        };

        const response = await api.post<BackendCreateCommentResponse>('/comments', payload);
        const now = new Date().toISOString();

        const comment: Comment = {
            id: String(response.data.commentId),
            targetType: data.targetType,
            targetId: data.targetId,
            authorId: '',
            authorName: undefined,
            content: data.content,
            createdAt: now,
            updatedAt: now,
        };

        return comment;
    },
};