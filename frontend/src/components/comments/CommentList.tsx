import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { commentsService } from '@/services/comments';
import { Comment } from '@/types/comment';

interface CommentListProps {
    targetType: 'item' | 'demand';
    targetId: string;
}

export function CommentList({ targetType, targetId }: CommentListProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const limit = 5;

    const fetchComments = useCallback(async (pageNum: number, append: boolean = false) => {
        try {
            setLoading(true);
            const data = await commentsService.getComments({
                targetType,
                targetId,
                page: pageNum,
                limit,
            });

            if (append) {
                setComments(prev => [...prev, ...data.comments]);
            } else {
                setComments(data.comments);
            }

            setTotal(data.total);
            setHasMore(pageNum < data.totalPages);
        } catch (error) {
            console.error('Failed to fetch comments', error);
        } finally {
            setLoading(false);
        }
    }, [targetType, targetId]);

    useEffect(() => {
        fetchComments(1);
    }, [fetchComments]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchComments(nextPage, true);
    };

    const handleCommentSuccess = () => {
        // Refresh list (reset to page 1)
        setPage(1);
        fetchComments(1, false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">留言 ({total})</h3>
            </div>

            <CommentForm
                targetType={targetType}
                targetId={targetId}
                onSuccess={handleCommentSuccess}
            />

            <div className="space-y-0 divide-y">
                {loading && page === 1 ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="py-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ))
                ) : comments.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        暂无留言，快来抢沙发吧~
                    </div>
                ) : (
                    <>
                        {comments.map((comment) => (
                            <CommentItem key={comment.id} comment={comment} />
                        ))}

                        {hasMore && (
                            <div className="pt-4 text-center">
                                <Button
                                    variant="ghost"
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                >
                                    {loading ? '加载中...' : '加载更多'}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
