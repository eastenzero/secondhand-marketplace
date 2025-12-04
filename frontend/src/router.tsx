import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireAdmin } from '@/components/auth/RequireAdmin';

// Lazy load pages
// Lazy load pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ItemListPage = lazy(() => import('./pages/items/ItemListPage'));
const ItemDetailPage = lazy(() => import('./pages/items/ItemDetailPage'));
const PublishItemPage = lazy(() => import('./pages/items/PublishItemPage'));
const DemandListPage = lazy(() => import('./pages/demands/DemandListPage'));
const DemandDetailPage = lazy(() => import('./pages/demands/DemandDetailPage'));
const PublishDemandPage = lazy(() => import('./pages/demands/PublishDemandPage'));
const MyPostsPage = lazy(() => import('./pages/me/MyPostsPage'));
const SettingsPage = lazy(() => import('./pages/me/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/me/NotificationsPage'));
const ChatPage = lazy(() => import('./pages/messages/ChatPage'));
const AdminReviewPage = lazy(() => import('./pages/admin/AdminReviewPage'));

import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';
import { SuspenseWrapper } from '@/components/layout/SuspenseWrapper';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        errorElement: <NotFound />,
        children: [
            { index: true, element: <Home /> },
            { path: 'login', element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
            { path: 'register', element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper> },
            {
                path: 'items',
                children: [
                    { index: true, element: <SuspenseWrapper><ItemListPage /></SuspenseWrapper> },
                    { path: ':id', element: <SuspenseWrapper><ItemDetailPage /></SuspenseWrapper> },
                ],
            },
            {
                path: 'publish/item',
                element: <RequireAuth><SuspenseWrapper><PublishItemPage /></SuspenseWrapper></RequireAuth>
            },
            {
                path: 'demands',
                children: [
                    { index: true, element: <SuspenseWrapper><DemandListPage /></SuspenseWrapper> },
                    { path: ':id', element: <SuspenseWrapper><DemandDetailPage /></SuspenseWrapper> },
                ],
            },
            {
                path: 'publish/demand',
                element: <RequireAuth><SuspenseWrapper><PublishDemandPage /></SuspenseWrapper></RequireAuth>
            },
            {
                path: 'me/posts',
                element: <RequireAuth><SuspenseWrapper><MyPostsPage /></SuspenseWrapper></RequireAuth>
            },
            {
                path: 'admin/review',
                element: <RequireAdmin><SuspenseWrapper><AdminReviewPage /></SuspenseWrapper></RequireAdmin>
            },
            {
                path: 'me/settings',
                element: <RequireAuth><SuspenseWrapper><SettingsPage /></SuspenseWrapper></RequireAuth>
            },
            {
                path: 'me/notifications',
                element: <RequireAuth><SuspenseWrapper><NotificationsPage /></SuspenseWrapper></RequireAuth>
            },
            {
                path: 'messages',
                element: <RequireAuth><SuspenseWrapper><ChatPage /></SuspenseWrapper></RequireAuth>
            },
        ],
    },
]);
