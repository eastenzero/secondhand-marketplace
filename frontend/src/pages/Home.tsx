import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, ArrowRight, BookOpen, Smartphone, Shirt, Armchair, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useItemStore } from '@/stores/useItemStore';
import { useDemandStore } from '@/stores/useDemandStore';
import { ItemCard } from '@/components/items/ItemCard';

export default function Home() {
    const navigate = useNavigate();
    const { items, fetchItems, isLoading: itemsLoading } = useItemStore();
    const { demands, fetchDemands, isLoading: demandsLoading } = useDemandStore();
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        fetchItems({ limit: 8, status: 'active' });
        fetchDemands({ limit: 4, status: 'active' });
    }, [fetchItems, fetchDemands]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/items?keyword=${encodeURIComponent(keyword)}`);
        }
    };

    const categories = [
        { id: 'electronics', name: '数码产品', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'books', name: '书籍教材', icon: BookOpen, color: 'text-green-500', bg: 'bg-green-50' },
        { id: 'clothing', name: '衣物服饰', icon: Shirt, color: 'text-pink-500', bg: 'bg-pink-50' },
        { id: 'furniture', name: '生活家具', icon: Armchair, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'others', name: '其他闲置', icon: MoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-50' },
    ];

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-primary/10 to-background pt-20 pb-32 overflow-hidden">
                <div className="container px-4 md:px-6 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
                        <Badge variant="secondary" className="px-4 py-1 text-sm rounded-full">
                            校园二手交易首选平台
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            让闲置物品<br />在校园里流动起来
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-[600px]">
                            安全、便捷、可信赖。连接全校师生，让每一件物品都能找到新的主人。
                        </p>

                        <div className="w-full max-w-md space-y-4">
                            <form onSubmit={handleSearch} className="relative flex items-center">
                                <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    className="pl-10 h-12 rounded-full shadow-sm"
                                    placeholder="搜索你想要的物品..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                                <Button type="submit" className="absolute right-1 rounded-full h-10 px-6">
                                    搜索
                                </Button>
                            </form>
                            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                                <span>热门搜索：</span>
                                <Link to="/items?keyword=iPhone" className="hover:text-primary underline decoration-dotted">iPhone</Link>
                                <Link to="/items?keyword=教材" className="hover:text-primary underline decoration-dotted">考研教材</Link>
                                <Link to="/items?keyword=自行车" className="hover:text-primary underline decoration-dotted">自行车</Link>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <Button size="lg" className="rounded-full px-8" onClick={() => navigate('/items')}>
                                <ShoppingBag className="mr-2 h-5 w-5" /> 开始购物
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full px-8" onClick={() => navigate('/publish/item')}>
                                发布闲置
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
                <div className="absolute bottom-0 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />
            </section>

            {/* Categories Section */}
            <section className="py-16 container">
                <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">浏览分类</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {categories.map((category) => (
                        <Link key={category.id} to={`/items?category=${category.id}`}>
                            <Card className="hover:shadow-md transition-all hover:-translate-y-1 border-none shadow-sm bg-card/50">
                                <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                                    <div className={`p-4 rounded-full ${category.bg} ${category.color}`}>
                                        <category.icon className="h-8 w-8" />
                                    </div>
                                    <span className="font-medium">{category.name}</span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Recent Items Section */}
            <section className="py-16 bg-muted/30">
                <div className="container">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">最新发布</h2>
                            <p className="text-muted-foreground mt-1">刚刚上架的好物，不容错过</p>
                        </div>
                        <Button variant="ghost" asChild>
                            <Link to="/items" className="group">
                                查看全部 <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    {itemsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-[300px] rounded-xl bg-muted animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {items.slice(0, 8).map((item) => (
                                <ItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Demands Section */}
            <section className="py-16 container">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">求购需求</h2>
                        <p className="text-muted-foreground mt-1">看看大家都在找什么，也许你有闲置</p>
                    </div>
                    <Button variant="ghost" asChild>
                        <Link to="/demands" className="group">
                            查看全部 <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {demandsLoading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
                        ))
                    ) : (
                        demands.slice(0, 4).map((demand) => (
                            <Card key={demand.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-lg line-clamp-1">{demand.title}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{demand.description}</p>
                                            <div className="flex items-center gap-2 pt-2">
                                                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                                                    预算: ¥{demand.minPrice} - {demand.maxPrice}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(demand.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <Button size="sm" onClick={() => navigate(`/demands/${demand.id}`)}>
                                            去报价
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
