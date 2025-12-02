import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error('Uncaught error in component tree', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
                    <div className="mb-8 rounded-full bg-destructive/10 p-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-destructive"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">出错了</h1>
                    <p className="text-muted-foreground mb-8 max-w-md">
                        抱歉，应用程序遇到了一些问题。我们已经自动记录了此错误。
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={this.handleReload} size="lg">
                            刷新页面
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => window.location.href = '/'}>
                            返回首页
                        </Button>
                    </div>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-left overflow-auto max-w-2xl w-full border">
                            <p className="font-mono text-xs text-destructive whitespace-pre-wrap">
                                {this.state.error.toString()}
                                {'\n\n'}
                                {this.state.error.stack}
                            </p>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
