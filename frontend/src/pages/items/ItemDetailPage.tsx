import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MessageCircle } from 'lucide-react';
import { useItemStore } from '@/stores/useItemStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Item, ItemStatus } from '@/types/item';
import { OfferDialog } from '@/components/offers/OfferDialog';
import { CommentList } from '@/components/comments/CommentList';
import { ImageGallery } from '@/components/items/ImageGallery';
import { ordersService } from '@/services/orders';
import { offersService } from '@/services/offers';
import { chatService } from '@/services/chat';

export default function ItemDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { fetchItem } = useItemStore();
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isBuying, setIsBuying] = useState(false);
    const [isContacting, setIsContacting] = useState(false);

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

    const handleBuyNow = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!item) return;
        if (item.sellerId === user.id) {
            toast.error('不能购买自己的商品');
            return;
        }

        setIsBuying(true);
        try {
            // 1. Create an offer with the current price
            // Note: In a real scenario, we might check if an offer already exists or have a direct "create order" endpoint
            // But based on current backend, we need an offer first.
            const offer = await offersService.createOffer({
                targetType: 'item',
                targetId: item.id,
                amount: item.price
            });

            // 2. Create order from offer
            const orderId = await ordersService.createOrder({
                offerId: offer.id
            });

            toast.success('下单成功');
            navigate(`/orders/${orderId}`);
        } catch (error) {
            console.error('Buy failed', error);
            toast.error('下单失败，请重试');
        } finally {
            setIsBuying(false);
        }
    };

    const handleContactSeller = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!item) return;
        if (item.sellerId === user.id) {
            toast.error('不能私聊自己');
            return;
        }

        setIsContacting(true);
        try {
            const threadId = await chatService.createThread({
                targetType: 'item',
                targetId: item.id,
                recipientId: item.sellerId,
                content: '你好，我对这件商品感兴趣'
            });
            navigate(`/messages?threadId=${threadId}`);
        } catch (error) {
            console.error('Contact failed', error);
            toast.error('发起会话失败');
        } finally {
            setIsContacting(false);
        }
    };

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
            {/* Left: Image Gallery */}
            <ImageGallery
                images={item.images && item.images.length > 0 ? item.images : (item.imageUrl ? [item.imageUrl] : [])}
                title={item.title}
            />

            {/* Right: Info & Actions */}
            <div className="space-y-6">
                <div>
                    <div className="flex items-center justify-between">
                        <Badge variant={item.status === ItemStatus.ACTIVE ? 'default' : 'secondary'} className="mb-2">
                            {item.status === ItemStatus.ACTIVE ? '在售' : '已售出'}
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
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold mb-2">卖家信息</h3>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.sellerName || item.sellerId}`} />
                                        <AvatarFallback>{(item.sellerName || 'U')[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{item.sellerName || 'Unknown Seller'}</p>
                                        <p className="text-xs text-muted-foreground">ID: {item.sellerId}</p>
                                    </div>
                                </div>
                            </div>
                            {user?.id !== item.sellerId && (
                                <Button variant="outline" size="sm" onClick={handleContactSeller} disabled={isContacting}>
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    联系卖家
                                </Button>
                            )}
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
                    <Button
                        size="lg"
                        className="flex-1"
                        onClick={handleBuyNow}
                        disabled={isBuying || item.status !== ItemStatus.ACTIVE || user?.id === item.sellerId}
                    >
                        {isBuying ? '下单中...' : '立即购买'}
                    </Button>
                    <div className="flex-1">
                        <OfferDialog
                            targetType="item"
                            targetId={item.id}
                            targetTitle={item.title}
                            targetOwnerId={item.sellerId}
                            trigger={<Button size="lg" variant="outline" className="w-full" disabled={user?.id === item.sellerId}>发起报价</Button>}
                            onSuccess={() => {
                                // Refresh item details to potentially show updated status or offer count
                                fetchItem(item.id);
                            }}
                        />
                    </div>
                </div>

                <div className="pt-8 border-t">
                    <CommentList targetType="item" targetId={item.id} />
                </div>
            </div>
        </div>
    );
}
