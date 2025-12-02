export const ERROR_MESSAGES: Record<string, string> = {
    // Auth
    AUTH_REQUIRED: '请先登录',
    AUTH_FAILED: '认证失败，请重新登录',
    TOKEN_EXPIRED: '登录已过期，请重新登录',
    FORBIDDEN: '无权访问此资源',
    FORBIDDEN_OWNER: '您无权操作此资源',

    // Resources
    NOT_FOUND: '请求的资源不存在',
    TARGET_NOT_FOUND: '目标资源不存在或已被删除',
    TARGET_NOT_ACTIVE: '目标资源状态不可用',

    // Validation
    INVALID_PARAM: '参数错误',
    INVALID_AMOUNT: '金额无效',
    CONTENT_INVALID: '内容包含敏感词或格式错误',

    // Business Logic
    SELF_OFFER_NOT_ALLOWED: '不能给自己报价',
    CONFLICT_STATE: '当前状态不允许此操作',

    // System
    INTERNAL_ERROR: '系统繁忙，请稍后重试',
    NETWORK_ERROR: '网络连接失败，请检查网络',
    UNKNOWN_ERROR: '发生未知错误',
};

export function getErrorMessage(code: string, defaultMessage?: string): string {
    return ERROR_MESSAGES[code] || defaultMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
}
