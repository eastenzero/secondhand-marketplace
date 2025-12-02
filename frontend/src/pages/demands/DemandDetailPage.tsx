import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDemandStore } from '@/stores/useDemandStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Demand } from '@/types/demand';
import { OfferDialog } from '@/components/offers/OfferDialog';
import { CommentList } from '@/components/comments/CommentList';

export default function DemandDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { fetchDemand } = useDemandStore();
    const [demand, setDemand] = useState<Demand | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const loadDemand = async () => {
            setLoading(true);
            const data = await fetchDemand(id);
            if (data) {
                setDemand(data);
                setError(null);
            } else {
                setError('需求不存在或已关闭');
            }
            setLoading(false);
        };

        loadDemand();
    }, [id, fetchDemand]);

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

    if (error || !demand) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <h2 className="text-2xl font-bold text-destructive mb-2">无法访问</h2>
                <p className="text-muted-foreground mb-4">{error || '未找到需求信息'}</p>
                <Button onClick={() => navigate('/demands')}>返回列表</Button>
            </div>
        );
    }

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            {/* Left: Image Gallery (Placeholder) */}
            <div className="overflow-hidden rounded-lg border bg-muted">
                {demand.imageUrl ? (
                    <img
                        src={demand.imageUrl}
                        alt={demand.title}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                ) : (
                    <div className="flex aspect-square items-center justify-center text-muted-foreground flex-col gap-2">
                        <span className="text-4xl">📢</span>
                        <span>无图片</span>
                    </div>
                )}
            </div>

            {/* Right: Info & Actions */}
            <div className="space-y-6">
                <div>
                    <div className="flex items-center justify-between">
                        <Badge variant={demand.status === 'active' ? 'default' : 'secondary'} className="mb-2">
                            {demand.status === 'active' ? '求购中' : '已满足'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            发布于 {new Date(demand.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold">{demand.title}</h1>
                    <div className="mt-4">
                        <span className="text-sm text-muted-foreground block mb-1">期望价格</span>
                        <span className="text-2xl font-bold text-primary">
                            ¥{demand.minPrice} - {demand.maxPrice}
                        </span>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">求购者信息</h3>
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                👤
                            </div>
                            <div>
                                <p className="font-medium">{demand.requesterName || 'Unknown User'}</p>
                                <p className="text-xs text-muted-foreground">ID: {demand.requesterId}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold">需求描述</h3>
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                        {demand.description}
                    </p>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                    <div className="flex-1">
                        <OfferDialog
                            targetType="demand"
                            targetId={demand.id}
                            targetTitle={demand.title}
                            targetOwnerId={demand.requesterId}
                            trigger={<Button size="lg" className="w-full">我有此物 (报价)</Button>}
                            onSuccess={() => {
                                fetchDemand(demand.id);
                            }}
                        />
                    </div>
                    <Button size="lg" variant="outline" className="flex-1">
                        联系求购者
                    </Button>
                </div>

                <div className="pt-8 border-t">
                    <CommentList targetType="demand" targetId={demand.id} />
                </div>
            </div>
        </div>
    );
}
