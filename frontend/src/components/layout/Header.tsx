import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, LogOut, Package, Heart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/useAuthStore';

export function Header() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [keyword, setKeyword] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/items?keyword=${encodeURIComponent(keyword)}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2 mr-4">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                        M
                    </div>
                    <span className="hidden font-bold sm:inline-block text-lg">Marketplace</span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link to="/items" className="transition-colors hover:text-primary text-muted-foreground">
                        闲置市场
                    </Link>
                    <Link to="/demands" className="transition-colors hover:text-primary text-muted-foreground">
                        求购广场
                    </Link>
                </nav>

                {/* Search Bar */}
                <div className="flex-1 flex items-center justify-center max-w-md mx-auto">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="搜索商品..."
                            className="w-full pl-9 bg-muted/50 focus:bg-background transition-colors rounded-full"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </form>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Search className="h-5 w-5" />
                    </Button>

                    {isAuthenticated ? (
                        <>
                            <Button
                                variant="default"
                                size="sm"
                                className="hidden md:flex gap-2 rounded-full"
                                onClick={() => navigate('/publish/item')}
                            >
                                <Plus className="h-4 w-4" />
                                发布
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt={user?.name} />
                                            <AvatarFallback>{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.role === 'admin' ? '管理员' : '普通用户'}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate('/me/posts')}>
                                        <Package className="mr-2 h-4 w-4" />
                                        我的发布
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate('/me/favorites')}>
                                        <Heart className="mr-2 h-4 w-4" />
                                        我的收藏
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate('/me/settings')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        个人设置
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        退出登录
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                                登录
                            </Button>
                            <Button size="sm" onClick={() => navigate('/register')}>
                                注册
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
