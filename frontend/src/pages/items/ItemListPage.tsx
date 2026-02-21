import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useItemStore } from '@/stores/useItemStore';
import { ItemCard } from '@/components/items/ItemCard';
import { ImageStyleToggle } from '@/components/ImageStyleToggle';
import { ItemFilters } from '@/components/items/ItemFilters';
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

export default function ItemListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, total, isLoading, error, fetchItems } = useItemStore();

  // Parse params
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 12; // Items per page
  const totalPages = Math.ceil(total / limit);

  const loadItems = () => {
    fetchItems({
      page,
      limit,
      keyword: searchParams.get('keyword') || undefined,
      category: searchParams.get('category') === 'all' ? undefined : searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    });
  };

  useEffect(() => {
    loadItems();
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
    // ItemFilters handles setting URL params, which triggers useEffect
    // We just need to ensure we don't double fetch if not needed, 
    // but useEffect dependency on searchParams handles it well.
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={loadItems}>重试</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-3xl font-bold tracking-tight">商品列表</h1>
          <ImageStyleToggle onStyleChange={loadItems} />
        </div>
        <ItemFilters onSearch={handleSearch} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <span className="text-xl">📦</span>
          </div>
          <h3 className="mt-4 text-lg font-semibold">暂无商品</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            没有找到符合条件的商品，换个关键词试试？
          </p>
          <Button variant="outline" onClick={() => setSearchParams({})}>
            清除筛选
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
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

                {/* Simple pagination logic for now */}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  // Show first, last, current, and neighbors
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
                  // Show ellipsis
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
