export interface ApiErrorData {
    code?: string;
    message?: string;
}

export interface ApiErrorResponse {
    response?: {
        data?: ApiErrorData;
        status?: number;
    };
    message?: string;
}
