export interface Comment {
    id: string;
    targetType: 'item' | 'demand';
    targetId: string;
    authorId: string;
    authorName?: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetCommentsParams {
    targetType: 'item' | 'demand';
    targetId: string;
    page?: number;
    limit?: number;
}

export interface CommentsResponse {
    comments: Comment[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CreateCommentDTO {
    targetType: 'item' | 'demand';
    targetId: string;
    content: string;
}
