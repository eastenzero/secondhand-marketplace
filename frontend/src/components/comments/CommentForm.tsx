import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/useAuthStore';
import { commentsService } from '@/services/comments';
import { ApiErrorResponse } from '@/types/api';

const commentSchema = z.object({
    content: z.string().min(1, '内容不能为空').max(500, '内容最多 500 个字符'),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentFormProps {
    targetType: 'item' | 'demand';
    targetId: string;
    onSuccess?: () => void;
}

export function CommentForm({ targetType, targetId, onSuccess }: CommentFormProps) {
    const { isAuthenticated } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CommentFormValues>({
        resolver: zodResolver(commentSchema),
    });

    const onSubmit = async (data: CommentFormValues) => {
        if (!isAuthenticated) {
            toast.error('请先登录');
            return;
        }

        setIsLoading(true);
        try {
            await commentsService.createComment({
                targetType,
                targetId,
                content: data.content,
            });
            toast.success('留言成功');
            reset();
            onSuccess?.();
        } catch (error) {
            console.error('Comment failed', error);
            const err = error as ApiErrorResponse;
            const code = err.response?.data?.code;
            if (code === 'CONTENT_INVALID') {
                toast.error('内容包含敏感词或格式错误');
            } else if (code === 'TARGET_NOT_FOUND') {
                toast.error('该内容不存在或已被删除');
            } else {
                toast.error('留言失败，请稍后重试');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="rounded-lg border bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">登录后参与讨论</p>
                <Button variant="outline" size="sm" asChild>
                    <a href="/login">去登录</a>
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Textarea
                    placeholder="写下你的留言..."
                    className="min-h-[100px] resize-none"
                    {...register('content')}
                    disabled={isLoading}
                />
                {errors.content && (
                    <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading} size="sm">
                    {isLoading ? '发送中...' : (
                        <>
                            <Send className="mr-2 h-4 w-4" /> 发送
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
