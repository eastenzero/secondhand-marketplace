# 二手交易平台 API 规范（MVP）

## 0. 约定
- 认证：JWT（HttpOnly Cookie: `sid`），有效期7天，滑动续期。未登录返回 401。
- 媒体类型：`application/json; charset=utf-8`
- 错误格式：`{ "code": "<ERROR_CODE>", "message": "<人类可读>" }`
- 状态码：200/201/204/400/401/403/404/409/422/500
- 版本：`/api` 前缀（MVP 无显式版本）。
- 映射：用例与 DFD 标注在各接口“对应”字段。

## 1. 认证

### 1.1 注册
- 方法/路径：POST `/api/register`
- 鉴权：无需
- 请求 JSON Schema：
```json
{
  "type": "object",
  "properties": {
    "username": {"type": "string", "minLength": 3, "maxLength": 50},
    "password": {"type": "string", "minLength": 6, "maxLength": 128},
    "contact": {
      "type": "object",
      "properties": {
        "phone": {"type": "string"},
        "email": {"type": "string", "format": "email"}
      },
      "additionalProperties": false
    }
  },
  "required": ["username", "password"]
}
```
- 响应：201 `{ "userId": 1 }`
- 错误：409 USERNAME_TAKEN，422 VALIDATION_ERROR
- 对应：用例“注册会员”；DFD“注册管理/用户库”

### 1.2 登录
- 方法/路径：POST `/api/login`
- 鉴权：无需
- 请求：`{ "username": "u", "password": "p" }`
- 响应：200，Set-Cookie: sid=<jwt>; HttpOnly; Secure
- 错误：401 AUTH_FAILED
- 对应：用例“登录”（DFD未明示，已在一致性中补充）

### 1.3 退出
- 方法/路径：POST `/api/logout`
- 鉴权：需要
- 响应：204，无体；清除 Cookie

## 2. 商品 Items

### 2.1 搜索商品
- 方法/路径：GET `/api/items?keywords&category&minPrice&maxPrice&page=1&size=20`
- 鉴权：游客可用
- 响应：200 `{ "total": 123, "items": [ {"itemId":1, "title":"...", "price":99.00, "status":"active"} ] }`
- 错误：400 INVALID_RANGE
- 对应：用例“搜索与查看详情”；DFD“搜索与报价处理/商品库”

### 2.2 查看商品详情
- 方法/路径：GET `/api/items/{id}`
- 鉴权：游客可用
- 响应：200 `{ item, offers:[], comments:[] }`
- 错误：404 NOT_FOUND
- 对应：同上

### 2.3 发布商品
- 方法/路径：POST `/api/items`
- 鉴权：会员
- 请求：`{ title, desc, category, price, images: ["url"], review: true|false }`
- 响应：201 `{ "itemId": 1, "status": "pending|active" }`
- 错误：401/403，422 VALIDATION_ERROR
- 对应：用例“发布信息”；DFD“商品与需求管理/商品库/日志”

### 2.4 更新/下架商品
- 方法/路径：PATCH `/api/items/{id}`
- 鉴权：会员（资源所有者）
- 请求：`{ action: "update|off", payload? }`
- 响应：200 `{ result: "ok" }`
- 错误：403 FORBIDDEN_OWNER，409 CONFLICT_STATE
- 对应：用例“信息管理”；DFD“各管理子过程”

## 3. 需求 Demands（对称于 Items）
- GET `/api/demands`（搜索）
- GET `/api/demands/{id}`（详情）
- POST `/api/demands`（发布）
- PATCH `/api/demands/{id}`（更新/下架）
- 语义与错误码与 Items 一致；对应 DFD“商品与需求管理/需求库”

## 4. 报价 Offers

### 4.1 发起报价
- 方法/路径：POST `/api/offers`
- 鉴权：会员
- 请求：`{ targetType: "item|demand", targetId: 1, amount: 88.00, message? }`
- 响应：201 `{ "offerId": 1, "status": "created" }`
- 错误：400 INVALID_AMOUNT，403 SELF_OFFER_NOT_ALLOWED，404 TARGET_NOT_FOUND，409 TARGET_NOT_ACTIVE
- 对应：用例“发起报价”；DFD“搜索与报价处理/报价库/商品库/需求库”

## 5. 留言 Comments

### 5.1 新增留言
- 方法/路径：POST `/api/comments`
- 鉴权：会员
- 请求：`{ targetType: "item|demand", targetId: 1, content: "..." }`
- 响应：201 `{ "commentId": 1 }`
- 错误：404 TARGET_NOT_FOUND，422 CONTENT_INVALID
- 对应：用例“留言互动”；DFD“留言管理/留言库”

### 5.2 列表留言
- 方法/路径：GET `/api/comments?targetType=item&targetId=1&page=1&size=20`
- 鉴权：游客可用
- 响应：200 `{ total, comments: [ {commentId, userId, content, createdAt} ] }`

## 6. 错误码（节选）

| code | 场景 |
| --- | --- |
| AUTH_REQUIRED | 需要登录 |
| AUTH_FAILED | 登录失败 |
| USERNAME_TAKEN | 用户名已被占用 |
| VALIDATION_ERROR | 字段校验失败 |
| NOT_FOUND | 资源不存在 |
| TARGET_NOT_FOUND | 目标不存在 |
| TARGET_NOT_ACTIVE | 目标未上架/无效 |
| FORBIDDEN_OWNER | 非资源所有者 |
| CONFLICT_STATE | 状态冲突 |
| INVALID_AMOUNT | 报价金额非法 |
| CONTENT_INVALID | 留言内容非法 |

## 7. 安全与鉴权
- Cookie: HttpOnly + Secure（生产），SameSite=Lax
- 密码：BCrypt 哈希（工作因子≥10）
- 授权：基于资源所有权与角色（member/admin）
- 审计：关键操作写入 `audit_logs`

附：更详细的字段 Schema 与示例以实际实现为准；本规范覆盖 MVP 关键路径：注册/登录、发布、搜索与详情、报价、留言、信息管理。
