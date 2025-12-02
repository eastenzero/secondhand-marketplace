import { Outlet, Link } from 'react-router-dom';
import { Toaster } from 'sonner';

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <div className="mr-4 hidden md:flex">
                        <Link to="/" className="mr-6 flex items-center space-x-2">
                            <span className="hidden font-bold sm:inline-block">二手交易平台</span>
                        </Link>
                        <nav className="flex items-center gap-6 text-sm">
                            <Link to="/items" className="transition-colors hover:text-foreground/80 text-foreground/60">商品</Link>
                            <Link to="/demands" className="transition-colors hover:text-foreground/80 text-foreground/60">需求</Link>
                        </nav>
                    </div>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <div className="w-full flex-1 md:w-auto md:flex-none">
                            {/* Search placeholder */}
                        </div>
                        <nav className="flex items-center">
                            <Link to="/login" className="text-sm font-medium transition-colors hover:text-primary">
                                登录
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="container py-6">
                <Outlet />
            </main>
            <footer className="py-6 md:px-8 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by Antigravity.
                    </p>
                </div>
            </footer>
            <Toaster />
        </div>
    );
}
