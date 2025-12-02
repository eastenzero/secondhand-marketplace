import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDemandStore } from '@/stores/useDemandStore';
import { DemandCard } from '@/components/demands/DemandCard';
import { ItemFilters } from '@/components/items/ItemFilters'; // Reusing filters
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/components/ui/pagination';

export default function DemandListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { demands, total, isLoading, error, fetchDemands } = useDemandStore();

    const page = parseInt(searchParams.get('page') || '1');
    const limit = 12;
    const totalPages = Math.ceil(total / limit);

    const loadDemands = () => {
        fetchDemands({
            page,
            limit,
            keyword: searchParams.get('keyword') || undefined,
            category: searchParams.get('category') === 'all' ? undefined : searchParams.get('category') || undefined,
            minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
            maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
        });
    };

    useEffect(() => {
        loadDemands();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage.toString());
        setSearchParams(newParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = () => {
        // Triggered by ItemFilters via URL params
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={loadDemands}>重试</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">需求广场</h1>
                <ItemFilters onSearch={handleSearch} />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-40 w-full rounded-lg" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : demands.length === 0 ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <span className="text-xl">📢</span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">暂无需求</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                        没有找到符合条件的需求，去发布一个？
                    </p>
                    <Button variant="outline" onClick={() => setSearchParams({})}>
                        清除筛选
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {demands.map((demand) => (
                            <DemandCard key={demand.id} demand={demand} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination className="mt-8">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(page - 1)}
                                        className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>

                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const p = i + 1;
                                    if (
                                        p === 1 ||
                                        p === totalPages ||
                                        (p >= page - 1 && p <= page + 1)
                                    ) {
                                        return (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    isActive={page === p}
                                                    onClick={() => handlePageChange(p)}
                                                    className="cursor-pointer"
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    }
                                    if (
                                        (p === page - 2 && p > 2) ||
                                        (p === page + 2 && p < totalPages - 1)
                                    ) {
                                        return (
                                            <PaginationItem key={p}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }
                                    return null;
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(page + 1)}
                                        className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </>
            )}
        </div>
    );
}
