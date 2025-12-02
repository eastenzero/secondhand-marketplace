import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useItemStore } from '@/stores/useItemStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Item } from '@/types/item';
import { OfferDialog } from '@/components/offers/OfferDialog';
import { CommentList } from '@/components/comments/CommentList';

export default function ItemDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { fetchItem } = useItemStore();
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const loadItem = async () => {
            setLoading(true);
            const data = await fetchItem(id);
            if (data) {
                setItem(data);
                setError(null);
            } else {
                setError('商品不存在或已下架');
            }
            setLoading(false);
        };

        loadItem();
    }, [id, fetchItem]);

    if (loading) {
        return (
            <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <div className="space-y-4">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <h2 className="text-2xl font-bold text-destructive mb-2">无法访问</h2>
                <p className="text-muted-foreground mb-4">{error || '未找到商品信息'}</p>
                <Button onClick={() => navigate('/items')}>返回列表</Button>
            </div>
        );
    }

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            {/* Left: Image Gallery (Placeholder) */}
            <div className="overflow-hidden rounded-lg border bg-muted">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                ) : (
                    <div className="flex aspect-square items-center justify-center text-muted-foreground">
                        No Image Available
                    </div>
                )}
            </div>

            {/* Right: Info & Actions */}
            <div className="space-y-6">
                <div>
                    <div className="flex items-center justify-between">
                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'} className="mb-2">
                            {item.status === 'active' ? '在售' : '已售出'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            发布于 {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold">{item.title}</h1>
                    <div className="mt-4 text-2xl font-bold text-primary">
                        ¥{item.price.toFixed(2)}
                    </div>
                </div>

                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">卖家信息</h3>
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                {/* Avatar placeholder */}
                                👤
                            </div>
                            <div>
                                <p className="font-medium">{item.sellerName || 'Unknown Seller'}</p>
                                <p className="text-xs text-muted-foreground">ID: {item.sellerId}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold">商品描述</h3>
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                        {item.description}
                    </p>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                    <Button size="lg" className="flex-1">
                        立即购买
                    </Button>
                    <div className="flex-1">
                        <OfferDialog
                            targetType="item"
                            targetId={item.id}
                            targetTitle={item.title}
                            targetOwnerId={item.sellerId}
                            trigger={<Button size="lg" variant="outline" className="w-full">发起报价</Button>}
                            onSuccess={() => {
                                // Refresh item details to potentially show updated status or offer count
                                fetchItem(item.id);
                            }}
                        />
                    </div>
                </div>

                {/* Placeholders for future features */}
                {/* <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    留言区域 (Coming in F7)
                </div> */}
                <div className="pt-8 border-t">
                    <CommentList targetType="item" targetId={item.id} />
                </div>
            </div>
        </div>
    );
}
