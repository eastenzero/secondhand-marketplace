import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

export function RequireAdmin({ children }: { children: JSX.Element }) {
    const { user, isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user?.role !== 'admin') {
        // Redirect to home or show 403 page. For now, redirect to home.
        // In a real app, we might want a dedicated 403 page.
        return <Navigate to="/" replace />;
    }

    return children;
}
