import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ordersService } from '@/services/orders';
import { Order, OrderStatus } from '@/types/order';

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchOrder = async () => {
            setIsLoading(true);
            try {
                const data = await ordersService.getOrder(id);
                setOrder(data);
            } catch (error) {
                console.error('Failed to fetch order', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleAction = async (action: 'pay' | 'cancel' | 'complete') => {
        if (!order) return;
        setIsUpdating(true);
        try {
            await ordersService.updateOrder(order.id, action);
            toast.success('操作成功');
            // Refresh order
            const updatedOrder = await ordersService.getOrder(order.id);
            setOrder(updatedOrder);
        } catch (error) {
            console.error('Action failed', error);
            toast.error('操作失败，请重试');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return <div className="container py-12 text-center">加载中...</div>;
    if (!order) return <div className="container py-12 text-center">订单不存在</div>;

    return (
        <div className="container max-w-3xl py-6 space-y-6">
            <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> 返回
            </Button>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">订单详情</h1>
                    <p className="text-sm text-muted-foreground mt-1">订单号: {order.id}</p>
                </div>
                <Badge className="text-lg px-4 py-1">
                    {order.status === OrderStatus.CREATED ? '待支付' :
                        order.status === OrderStatus.PAID ? '已支付' :
                            order.status === OrderStatus.COMPLETED ? '已完成' : order.status}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Package className="h-4 w-4" /> 商品信息
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="h-20 w-20 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                                    商品图
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">{item.targetTitle || '商品'}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">数量: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">¥{item.price}</p>
                                </div>
                            </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>总计</span>
                            <span>¥{order.totalAmount}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="h-4 w-4" /> 收货信息
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {order.shippingAddress || '暂无收货地址信息'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CreditCard className="h-4 w-4" /> 支付信息
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {order.paymentMethod || '在线支付'}
                            </p>

                            {order.status === OrderStatus.CREATED && (
                                <div className="space-y-2">
                                    <Button
                                        className="w-full"
                                        onClick={() => handleAction('pay')}
                                        disabled={isUpdating}
                                    >
                                        立即支付
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => handleAction('cancel')}
                                        disabled={isUpdating}
                                    >
                                        取消订单
                                    </Button>
                                </div>
                            )}

                            {order.status === OrderStatus.PAID && (
                                <Button
                                    className="w-full"
                                    onClick={() => handleAction('complete')}
                                    disabled={isUpdating}
                                >
                                    确认收货
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
