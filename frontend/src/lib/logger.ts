type LogLevel = 'info' | 'warn' | 'error';

class Logger {
    private static instance: Logger;
    private isDev: boolean;

    private constructor() {
        this.isDev = import.meta.env.DEV;
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public info(message: string, meta?: unknown) {
        if (this.isDev) {
            console.log(`[INFO] ${message}`, meta || '');
        }
        // In production, you might send this to a backend logging service
        this.logToService('info', message, meta);
    }

    public warn(message: string, meta?: unknown) {
        if (this.isDev) {
            console.warn(`[WARN] ${message}`, meta || '');
        }
        this.logToService('warn', message, meta);
    }

    public error(message: string, error?: unknown, meta?: unknown) {
        if (this.isDev) {
            console.error(`[ERROR] ${message}`, error || '', meta || '');
        }
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.logToService('error', message, { ...(meta as object), error: errorMsg });
    }

    private logToService(level: LogLevel, message: string, meta?: unknown) {
        // Placeholder for sending logs to backend
        // Use params to avoid lint error
        if (!this.isDev) {
            console.log(level, message, meta);
        }
    }
}

export const logger = Logger.getInstance();
