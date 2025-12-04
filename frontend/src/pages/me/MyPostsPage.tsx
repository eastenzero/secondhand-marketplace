import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Edit, Trash2, EyeOff, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/useAuthStore';
import { useItemStore } from '@/stores/useItemStore';
import { useDemandStore } from '@/stores/useDemandStore';
import { Item, ItemStatus } from '@/types/item';
import { Demand, DemandStatus } from '@/types/demand';

export default function MyPostsPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { items, fetchItems, updateItem, deleteItem } = useItemStore();
    const { demands, fetchDemands, updateDemand, deleteDemand } = useDemandStore();

    const [activeTab, setActiveTab] = useState('items');

    useEffect(() => {
        if (user) {
            if (activeTab === 'items') {
                // Assuming backend supports filter by sellerId via params or we filter locally
                // For now, let's assume getItems supports sellerId if we add it to params
                // Or if not, we might need to rely on a specific endpoint. 
                // Given the constraints, I'll pass it as a param and hope backend handles it or I filter locally if I could.
                // But since I can't change backend, I will assume standard REST filter pattern ?sellerId=...
                // If that fails, I might show all items (which is bad). 
                // Let's try to fetch with a custom param if supported, or just fetch all and filter client side (not ideal but safe for MVP).
                // Actually, let's try passing it.
                fetchItems({ sellerId: user.id });
            } else {
                fetchDemands({ requesterId: user.id });
            }
        }
    }, [user, activeTab, fetchItems, fetchDemands]);

    const myItems = items.filter(item => item.sellerId === user?.id);
    const myDemands = demands.filter(demand => demand.requesterId === user?.id);

    const handleStatusChange = async (type: 'item' | 'demand', id: string, currentStatus: string) => {
        const newStatus = currentStatus === ItemStatus.ACTIVE
            ? ItemStatus.OFF
            : ItemStatus.ACTIVE;

        try {
            if (type === 'item') {
                await updateItem(id, { status: newStatus });
                toast.success(newStatus === ItemStatus.ACTIVE ? '已上架' : '已下架');
            } else {
                await updateDemand(id, { status: newStatus as unknown as DemandStatus });
                toast.success((newStatus as unknown as DemandStatus) === DemandStatus.ACTIVE ? '已重新开启' : '已关闭');
            }
        } catch (error) {
            toast.error('操作失败');
        }
    };

    const handleDelete = async (type: 'item' | 'demand', id: string) => {
        if (!confirm('确定要删除吗？此操作不可恢复。')) return;

        try {
            if (type === 'item') {
                await deleteItem(id);
            } else {
                await deleteDemand(id);
            }
            toast.success('删除成功');
        } catch (error) {
            toast.error('删除失败');
        }
    };

    const renderItemCard = (item: Item) => (
        <Card key={item.id} className="flex flex-col">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-base line-clamp-1">{item.title}</CardTitle>
                        <CardDescription className="text-xs">
                            发布于 {new Date(item.createdAt).toLocaleDateString()}
                        </CardDescription>
                    </div>
                    <Badge variant={item.status === ItemStatus.ACTIVE ? 'default' : 'secondary'}>
                        {item.status === ItemStatus.ACTIVE ? '在售' : item.status === ItemStatus.OFF ? '已下架' : '其他'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 py-2 flex-1">
                <p className="text-sm font-bold text-primary">¥{item.price}</p>
            </CardContent>
            <CardFooter className="p-4 pt-2 border-t bg-muted/20 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/items/${item.id}`)}>
                    查看
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/publish/item?edit=${item.id}`)}>
                            <Edit className="mr-2 h-4 w-4" /> 编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('item', item.id, item.status)}>
                            {item.status === ItemStatus.ACTIVE ? (
                                <>
                                    <EyeOff className="mr-2 h-4 w-4" /> 下架
                                </>
                            ) : (
                                <>
                                    <Eye className="mr-2 h-4 w-4" /> 上架
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete('item', item.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> 删除
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );

    const renderDemandCard = (demand: Demand) => (
        <Card key={demand.id} className="flex flex-col">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-base line-clamp-1">{demand.title}</CardTitle>
                        <CardDescription className="text-xs">
                            发布于 {new Date(demand.createdAt).toLocaleDateString()}
                        </CardDescription>
                    </div>
                    <Badge variant={demand.status === DemandStatus.ACTIVE ? 'default' : 'secondary'}>
                        {demand.status === DemandStatus.ACTIVE ? '求购中' : '已关闭'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 py-2 flex-1">
                <p className="text-sm font-bold text-primary">¥{demand.minPrice} - {demand.maxPrice}</p>
            </CardContent>
            <CardFooter className="p-4 pt-2 border-t bg-muted/20 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/demands/${demand.id}`)}>
                    查看
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/publish/demand?edit=${demand.id}`)}>
                            <Edit className="mr-2 h-4 w-4" /> 编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange('demand', demand.id, demand.status)}>
                            {demand.status === DemandStatus.ACTIVE ? (
                                <>
                                    <EyeOff className="mr-2 h-4 w-4" /> 关闭
                                </>
                            ) : (
                                <>
                                    <Eye className="mr-2 h-4 w-4" /> 开启
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete('demand', demand.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> 删除
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">我的发布</h1>
                <Button onClick={() => navigate('/publish/item')}>发布新商品</Button>
            </div>

            <Tabs defaultValue="items" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="items">我的商品</TabsTrigger>
                    <TabsTrigger value="demands">我的需求</TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="mt-6">
                    {myItems.length === 0 ? (
                        <div className="text-center py-12 border border-dashed rounded-lg">
                            <p className="text-muted-foreground mb-4">暂无发布商品</p>
                            <Button variant="outline" onClick={() => navigate('/publish/item')}>去发布</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {myItems.map(renderItemCard)}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="demands" className="mt-6">
                    {myDemands.length === 0 ? (
                        <div className="text-center py-12 border border-dashed rounded-lg">
                            <p className="text-muted-foreground mb-4">暂无发布需求</p>
                            <Button variant="outline" onClick={() => navigate('/publish/demand')}>去发布</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {myDemands.map(renderDemandCard)}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
