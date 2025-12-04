import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MoreVertical, Phone, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { chatService } from '@/services/chat';
import { ChatThread, Message } from '@/types/chat';
import { useAuthStore } from '@/stores/useAuthStore';

export default function ChatPage() {
    const [searchParams] = useSearchParams();
    const { user } = useAuthStore();
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoadingThreads, setIsLoadingThreads] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize: Load threads and handle URL param
    useEffect(() => {
        const init = async () => {
            try {
                const data = await chatService.getThreads();
                setThreads(data);

                const urlThreadId = searchParams.get('threadId');
                if (urlThreadId) {
                    // If URL has threadId, select it. 
                    // Note: If it's a new real thread, it might not be in the mock list.
                    // We should handle this "ghost" thread scenario if possible, 
                    // but for now let's just set it and try to load messages.
                    setSelectedId(urlThreadId);

                    // If it's not in the list, we might want to add a temporary placeholder
                    // so the UI shows something selected.
                    if (!data.find(t => t.id === urlThreadId)) {
                        // Create a temporary thread object for display
                        const tempThread: ChatThread = {
                            id: urlThreadId,
                            targetType: 'system', // Default
                            targetId: '0',
                            unreadCount: 0,
                            updatedAt: new Date().toISOString(),
                            otherUser: { id: 'unknown', name: 'Loading...' }
                        };
                        setThreads(prev => [tempThread, ...prev]);
                    }
                } else if (data.length > 0) {
                    setSelectedId(data[0].id);
                }
            } catch (error) {
                console.error('Failed to load threads', error);
                toast.error('加载会话列表失败');
            } finally {
                setIsLoadingThreads(false);
            }
        };
        init();
    }, [searchParams]);

    // Load messages when selected thread changes
    useEffect(() => {
        if (!selectedId) return;

        const loadMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const data = await chatService.getMessages(selectedId);
                // Sort by time ascending
                const sorted = data.messages.sort((a, b) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                setMessages(sorted);
            } catch (error) {
                console.error('Failed to load messages', error);
                // Don't show error for mock IDs that fail
                if (!selectedId.startsWith('mock-')) {
                    toast.error('加载消息失败');
                }
            } finally {
                setIsLoadingMessages(false);
            }
        };
        loadMessages();
    }, [selectedId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !selectedId) return;

        const content = inputValue;
        setInputValue(''); // Clear immediately for better UX

        try {
            const newMessage = await chatService.sendMessage(selectedId, content);
            // Optimistic update
            setMessages(prev => [...prev, {
                ...newMessage,
                senderId: String(user?.id || 'me') // Ensure senderId matches current user
            }]);

            // Update thread last message preview
            setThreads(prev => prev.map(t => {
                if (t.id === selectedId) {
                    return {
                        ...t,
                        lastMessage: newMessage,
                        updatedAt: new Date().toISOString()
                    };
                }
                return t;
            }));
        } catch (error) {
            console.error('Failed to send message', error);
            toast.error('发送失败');
            setInputValue(content); // Restore content
        }
    };

    const selectedThread = threads.find(t => t.id === selectedId);

    return (
        <div className="container h-[calc(100vh-8rem)] py-6">
            <Card className="grid h-full grid-cols-[300px_1fr] overflow-hidden">
                {/* Sidebar */}
                <div className="border-r flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold">消息列表</h2>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col">
                            {isLoadingThreads ? (
                                <div className="p-4 text-center text-muted-foreground">加载中...</div>
                            ) : threads.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">暂无会话</div>
                            ) : (
                                threads.map((thread) => (
                                    <button
                                        key={thread.id}
                                        className={`flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50 ${selectedId === thread.id ? 'bg-muted' : ''}`}
                                        onClick={() => setSelectedId(thread.id)}
                                    >
                                        <Avatar>
                                            <AvatarImage src={thread.otherUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.otherUser.name}`} />
                                            <AvatarFallback>{thread.otherUser.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{thread.otherUser.name}</span>
                                                {thread.unreadCount > 0 && (
                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                                        {thread.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {thread.lastMessage?.content || '暂无消息'}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Chat Area */}
                {selectedId ? (
                    <div className="flex flex-col h-full">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between border-b p-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={selectedThread?.otherUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedThread?.otherUser.name || 'User'}`} />
                                    <AvatarFallback>{selectedThread?.otherUser.name?.[0] || '?'}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{selectedThread?.otherUser.name || '未知用户'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon">
                                    <Phone className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Video className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {isLoadingMessages ? (
                                    <div className="text-center text-muted-foreground">加载消息中...</div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-muted-foreground">暂无消息，打个招呼吧</div>
                                ) : (
                                    messages.map((message) => {
                                        // Check if message is from current user
                                        // Note: user.id is number usually, message.senderId is string
                                        const isMe = String(message.senderId) === String(user?.id) || message.senderId === 'me';
                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-lg px-4 py-2 ${isMe
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                        }`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                    <span className={`text-[10px] ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'} block text-right mt-1`}>
                                                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    placeholder="输入消息..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    disabled={!selectedId}
                                />
                                <Button type="submit" size="icon" disabled={!selectedId || !inputValue.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        选择一个对话开始聊天
                    </div>
                )}
            </Card>
        </div>
    );
}
