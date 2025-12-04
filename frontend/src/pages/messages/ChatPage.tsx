import { useState } from 'react';
import { Send, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
}

interface Conversation {
    id: string;
    userId: string;
    userName: string;
    lastMessage: string;
    unreadCount: number;
    messages: Message[];
}

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: '1',
        userId: 'user1',
        userName: 'Alice',
        lastMessage: '这个价格可以再便宜点吗？',
        unreadCount: 2,
        messages: [
            { id: 'm1', senderId: 'user1', content: '你好，请问 iPhone 15 还在吗？', timestamp: '10:00' },
            { id: 'm2', senderId: 'me', content: '在的，99新，无划痕。', timestamp: '10:05' },
            { id: 'm3', senderId: 'user1', content: '这个价格可以再便宜点吗？', timestamp: '10:10' },
        ]
    },
    {
        id: '2',
        userId: 'user2',
        userName: 'Bob',
        lastMessage: '好的，下午见。',
        unreadCount: 0,
        messages: [
            { id: 'm4', senderId: 'me', content: '下午三点图书馆门口交易可以吗？', timestamp: '14:00' },
            { id: 'm5', senderId: 'user2', content: '好的，下午见。', timestamp: '14:05' },
        ]
    }
];

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [selectedId, setSelectedId] = useState<string | null>(MOCK_CONVERSATIONS[0].id);
    const [inputValue, setInputValue] = useState('');

    const selectedConversation = conversations.find(c => c.id === selectedId);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !selectedId) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: 'me',
            content: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setConversations(prev => prev.map(c => {
            if (c.id === selectedId) {
                return {
                    ...c,
                    messages: [...c.messages, newMessage],
                    lastMessage: inputValue,
                };
            }
            return c;
        }));

        setInputValue('');
    };

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
                            {conversations.map((conversation) => (
                                <button
                                    key={conversation.id}
                                    className={`flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50 ${selectedId === conversation.id ? 'bg-muted' : ''}`}
                                    onClick={() => setSelectedId(conversation.id)}
                                >
                                    <Avatar>
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.userName}`} />
                                        <AvatarFallback>{conversation.userName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{conversation.userName}</span>
                                            {conversation.unreadCount > 0 && (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                                    {conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {conversation.lastMessage}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Chat Area */}
                {selectedConversation ? (
                    <div className="flex flex-col h-full">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between border-b p-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.userName}`} />
                                    <AvatarFallback>{selectedConversation.userName[0]}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{selectedConversation.userName}</span>
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
                                {selectedConversation.messages.map((message) => {
                                    const isMe = message.senderId === 'me';
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
                                                    {message.timestamp}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    placeholder="输入消息..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                                <Button type="submit" size="icon">
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
