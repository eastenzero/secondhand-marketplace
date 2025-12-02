import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Comment } from '@/types/comment';

interface CommentItemProps {
    comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
    return (
        <div className="flex gap-4 py-4 border-b last:border-0">
            <Avatar className="h-10 w-10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorId}`} />
                <AvatarFallback>{comment.authorName?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{comment.authorName || 'Unknown User'}</p>
                    <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground break-all whitespace-pre-wrap">
                    {comment.content}
                </p>
            </div>
        </div>
    );
}
