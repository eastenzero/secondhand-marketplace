import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ordersService } from '@/services/orders';
import { Order } from '@/types/order';

export default function OrderListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const role = (searchParams.get('role') as 'buyer' | 'seller') || 'buyer';

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const data = await ordersService.getOrders(role);
                setOrders(data.orders);
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [role]);

    const handleTabChange = (value: string) => {
        setSearchParams({ role: value });
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            created: { label: '待支付', variant: 'outline' },
            paid: { label: '已支付', variant: 'default' },
            shipped: { label: '已发货', variant: 'secondary' },
            completed: { label: '已完成', variant: 'default' },
            canceled: { label: '已取消', variant: 'destructive' },
        };
        const config = map[status] || { label: status, variant: 'outline' };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    return (
        <div className="container py-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">我的订单</h1>
            </div>

            <Tabs defaultValue={role} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="buyer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        我买到的
                    </TabsTrigger>
                    <TabsTrigger value="seller">
                        <Store className="mr-2 h-4 w-4" />
                        我卖出的
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-4">
                    {isLoading ? (
                        <div className="text-center py-12">加载中...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 border border-dashed rounded-lg">
                            <p className="text-muted-foreground mb-4">暂无订单</p>
                            <Button variant="outline" onClick={() => navigate('/items')}>去逛逛</Button>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <Card key={order.id} className="overflow-hidden">
                                <CardHeader className="bg-muted/30 pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                            <span>订单号: {order.id}</span>
                                        </div>
                                        {getStatusBadge(order.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                                                商品图
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium">{item.targetTitle || '商品'}</h3>
                                                <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">¥{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                                <CardFooter className="bg-muted/10 p-4 flex items-center justify-between">
                                    <div className="text-sm">
                                        实付: <span className="font-bold text-lg">¥{order.totalAmount}</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
                                        查看详情
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </Tabs>
        </div>
    );
}
