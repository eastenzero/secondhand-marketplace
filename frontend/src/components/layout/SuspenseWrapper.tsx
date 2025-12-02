import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><LoadingSpinner /></div>}>
        {children}
    </Suspense>
);
