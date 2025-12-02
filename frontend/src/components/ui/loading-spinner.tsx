import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> { }

export function LoadingSpinner({ className, ...props }: LoadingSpinnerProps) {
    return (
        <div className={cn("flex justify-center items-center p-4", className)} {...props}>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
    );
}
