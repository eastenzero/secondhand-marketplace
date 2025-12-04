import { useEffect, useState } from 'react';
import { Bell, MessageSquare, Tag, Info, Check, ShoppingBag, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notificationsService } from '@/services/notifications';
import { Notification } from '@/types/notification';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const data = await notificationsService.getNotifications();
            setNotifications(data.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
            // toast.error('获取通知失败'); // api.ts might already show toast
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await notificationsService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error('Failed to mark as read', error);
            toast.error('操作失败');
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        if (unreadIds.length === 0) return;

        try {
            // Since there is no bulk API, we process them in parallel
            await Promise.all(unreadIds.map(id => notificationsService.markAsRead(id)));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('全部已读');
        } catch (error) {
            console.error('Failed to mark all as read', error);
            toast.error('部分操作失败，请重试');
            // Refresh list to ensure consistency
            fetchNotifications();
        }
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'system': return <Info className="h-5 w-5 text-blue-500" />;
            case 'offer': return <Tag className="h-5 w-5 text-orange-500" />;
            case 'comment': return <MessageSquare className="h-5 w-5 text-green-500" />;
            case 'order': return <ShoppingBag className="h-5 w-5 text-purple-500" />;
            case 'review': return <Star className="h-5 w-5 text-yellow-500" />;
            default: return <Bell className="h-5 w-5" />;
        }
    };

    return (
        <div className="container max-w-3xl py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">消息通知</h1>
                    <p className="text-muted-foreground">查看最新的系统消息和互动提醒</p>
                </div>
                <Button
                    variant="outline"
                    onClick={markAllAsRead}
                    disabled={isLoading || notifications.every(n => n.isRead)}
                >
                    <Check className="mr-2 h-4 w-4" />
                    全部已读
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        通知列表
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                        <div className="divide-y">
                            {isLoading ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    加载中...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    暂无消息
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 flex gap-4 transition-colors hover:bg-muted/50 cursor-pointer ${!notification.isRead ? 'bg-primary/5' : ''}`}
                                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                                    >
                                        <div className="mt-1">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium leading-none">
                                                    {notification.title}
                                                    {!notification.isRead && (
                                                        <Badge variant="secondary" className="ml-2 h-2 w-2 rounded-full p-0 bg-red-500" />
                                                    )}
                                                </p>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {notification.content}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
