import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Toaster } from 'sonner';

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <Header />
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
