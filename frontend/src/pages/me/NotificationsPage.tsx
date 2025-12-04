import { useState } from 'react';
import { Bell, MessageSquare, Tag, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
    id: string;
    type: 'system' | 'comment' | 'offer';
    title: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'system',
        title: '欢迎来到二手交易平台',
        content: '祝您使用愉快！如果有任何问题，请联系管理员。',
        isRead: false,
        createdAt: '2024-03-10T10:00:00Z',
    },
    {
        id: '2',
        type: 'offer',
        title: '收到新的报价',
        content: '用户 "Alice" 对您的商品 "iPhone 15" 报价 ¥5000',
        isRead: false,
        createdAt: '2024-03-11T14:30:00Z',
    },
    {
        id: '3',
        type: 'comment',
        title: '收到新的留言',
        content: '用户 "Bob" 在您的商品 "考研英语书" 下留言：请问还在吗？',
        isRead: true,
        createdAt: '2024-03-12T09:15:00Z',
    },
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'system': return <Info className="h-5 w-5 text-blue-500" />;
            case 'offer': return <Tag className="h-5 w-5 text-orange-500" />;
            case 'comment': return <MessageSquare className="h-5 w-5 text-green-500" />;
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
                <Button variant="outline" onClick={markAllAsRead} disabled={notifications.every(n => n.isRead)}>
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
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 flex gap-4 transition-colors hover:bg-muted/50 ${!notification.isRead ? 'bg-primary/5' : ''}`}
                                    onClick={() => markAsRead(notification.id)}
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
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {notification.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {notifications.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    暂无消息
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
