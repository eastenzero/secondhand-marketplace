import { api } from './api';
import { Comment, GetCommentsParams, CommentsResponse, CreateCommentDTO } from '@/types/comment';

export const commentsService = {
    getComments: async (params: GetCommentsParams) => {
        const response = await api.get<CommentsResponse>('/comments', { params });
        return response.data;
    },

    createComment: async (data: CreateCommentDTO) => {
        const response = await api.post<Comment>('/comments', data);
        return response.data;
    },
};
