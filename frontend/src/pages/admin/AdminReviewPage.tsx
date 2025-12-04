import { useEffect, useState, useCallback } from 'react';
import { Check, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { itemsService } from '@/services/items';
import { demandsService } from '@/services/demands';
import { Item, ItemStatus } from '@/types/item';
import { Demand, DemandStatus } from '@/types/demand';

export default function AdminReviewPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [demands, setDemands] = useState<Demand[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('items');

    const fetchPendingItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await itemsService.getItems({ status: ItemStatus.PENDING, limit: 100 });
            setItems(data.items);
        } catch (error) {
            console.error('Failed to fetch pending items', error);
            toast.error('获取待审核商品失败');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchPendingDemands = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await demandsService.getDemands({ status: DemandStatus.PENDING, limit: 100 });
            setDemands(data.demands);
        } catch (error) {
            console.error('Failed to fetch pending demands', error);
            toast.error('获取待审核需求失败');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'items') {
            fetchPendingItems();
        } else {
            fetchPendingDemands();
        }
    }, [activeTab, fetchPendingItems, fetchPendingDemands]);

    const handleReview = async (type: 'item' | 'demand', id: string, action: 'approve' | 'reject') => {
        // Backend doesn't support 'rejected' status yet, so we use 'off' for now or 'draft'
        // Doc says "Action=off or separate audit". Let's use OFF for rejected.
        const newStatus = action === 'approve'
            ? (type === 'item' ? ItemStatus.ACTIVE : DemandStatus.ACTIVE)
            : (type === 'item' ? ItemStatus.OFF : DemandStatus.OFF);

        try {
            if (type === 'item') {
                await itemsService.updateItem(id, { status: newStatus as ItemStatus });
                setItems(prev => prev.filter(item => item.id !== id));
            } else {
                await demandsService.updateDemand(id, { status: newStatus as DemandStatus });
                setDemands(prev => prev.filter(demand => demand.id !== id));
            }
            toast.success(action === 'approve' ? '已通过' : '已拒绝');
        } catch (error) {
            console.error('Review failed', error);
            toast.error('操作失败');
        }
    };

    return (
        <div className="container py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">内容审核</h1>
            </div>

            <Tabs defaultValue="items" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="items">待审核商品 ({items.length})</TabsTrigger>
                    <TabsTrigger value="demands">待审核需求 ({demands.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="mt-6">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>标题</TableHead>
                                    <TableHead>价格</TableHead>
                                    <TableHead>发布人</TableHead>
                                    <TableHead>发布时间</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            加载中...
                                        </TableCell>
                                    </TableRow>
                                ) : items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            暂无待审核商品
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Link to={`/items/${item.id}`} className="hover:underline flex items-center gap-1" target="_blank">
                                                        {item.title}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                    {item.images && item.images.length > 0 && (
                                                        <Badge variant="outline" className="text-xs">图</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>¥{item.price}</TableCell>
                                            <TableCell>{item.sellerName || item.sellerId}</TableCell>
                                            <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handleReview('item', item.id, 'approve')}
                                                >
                                                    <Check className="h-4 w-4 mr-1" /> 通过
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleReview('item', item.id, 'reject')}
                                                >
                                                    <X className="h-4 w-4 mr-1" /> 拒绝
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="demands" className="mt-6">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>标题</TableHead>
                                    <TableHead>预算范围</TableHead>
                                    <TableHead>发布人</TableHead>
                                    <TableHead>发布时间</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            加载中...
                                        </TableCell>
                                    </TableRow>
                                ) : demands.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            暂无待审核需求
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    demands.map((demand) => (
                                        <TableRow key={demand.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Link to={`/demands/${demand.id}`} className="hover:underline flex items-center gap-1" target="_blank">
                                                        {demand.title}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                    {demand.images && demand.images.length > 0 && (
                                                        <Badge variant="outline" className="text-xs">图</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>¥{demand.minPrice} - {demand.maxPrice}</TableCell>
                                            <TableCell>{demand.requesterName || demand.requesterId}</TableCell>
                                            <TableCell>{new Date(demand.createdAt).toLocaleString()}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handleReview('demand', demand.id, 'approve')}
                                                >
                                                    <Check className="h-4 w-4 mr-1" /> 通过
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleReview('demand', demand.id, 'reject')}
                                                >
                                                    <X className="h-4 w-4 mr-1" /> 拒绝
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
