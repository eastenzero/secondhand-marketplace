import { useRouteError, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    const error = useRouteError() as { statusText?: string; message?: string } | null;
    const navigate = useNavigate();

    console.error(error);

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
            <div className="relative mb-8">
                <h1 className="text-9xl font-black text-muted/20 select-none">404</h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold bg-background px-4">页面未找到</span>
                </div>
            </div>

            <p className="text-muted-foreground max-w-md mb-8">
                抱歉，您访问的页面不存在或已被移除。
                {error && (
                    <span className="block mt-2 font-mono text-xs bg-muted p-2 rounded">
                        Error: {error.statusText || error.message}
                    </span>
                )}
            </p>

            <div className="flex gap-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> 返回上一页
                </Button>
                <Button onClick={() => navigate('/')}>
                    <Home className="mr-2 h-4 w-4" /> 回到首页
                </Button>
            </div>
        </div>
    );
}
