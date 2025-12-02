# 后端冒烟测试提示词（MVP 版本）

本指南用于在本地或测试环境对 Spring Boot 后端进行 **冒烟测试 / 回归检查**，覆盖 S0–S10 核心用例和关键非功能点（认证、安全、限流、审计等）。

> 假设：PostgreSQL 已就绪，Flyway 自动迁移；`application.yml` 中的 DB/JWT 配置有效。

---

## 0. 启动与基础检查

1. **构建与测试**
   - 在 `backend/` 目录执行：`mvn test`
   - 预期：构建成功，关键集成测试（Auth/Item/Offer/Comment）通过。

2. **运行服务**
   - 在 `backend/` 目录执行：`mvn spring-boot:run`
   - 预期：应用启动在 `SERVER_PORT`（默认 8080），Flyway 迁移成功，无严重错误日志。

3. **健康检查**
   - 请求：`GET http://localhost:8080/actuator/health`
   - 预期：`200 { "status": "UP", ... }`。

---

## 1. 认证与限流相关用例

### TC-REG-001 注册成功

- **请求**  
  `POST /api/register`
- **示例 Body**：
  ```json
  {
    "username": "user_reg_1",
    "password": "password123",
    "contact": { "phone": "123", "email": "u1@example.com" }
  }
  ```
- **预期**：
  - 状态码：`201 Created`
  - 响应体：`{ "userId": <number> }`
  - 审计日志中应出现 `action=REGISTER` 记录。

### TC-AUTH-002 登录失败（含限流前的错误处理）

- **请求**  
  `POST /api/login`
- **示例 Body**：
  ```json
  { "username": "not_exists", "password": "wrong" }
  ```
- **预期**：
  - 状态码：`401 Unauthorized`
  - 响应体：`{ "code": "AUTH_FAILED", "message": "Invalid username or password" }`
  - 审计日志：`action=LOGIN_FAILED`。

### 登录成功（用于后续用例获取 Cookie）

- **前置**：已用 `/api/register` 注册用户 `user_smoke`。
- **请求**  
  `POST /api/login`
- **示例 Body**：
  ```json
  { "username": "user_smoke", "password": "password123" }
  ```
- **预期**：
  - 状态码：`200 OK`
  - 响应头：`Set-Cookie: sid=<jwt>; HttpOnly; Path=/ ...`
  - 后续请求需携带该 Cookie 以通过认证。

### 登录/注册限流（可选强化检查）

- 同一 IP 在 60 秒内反复请求 `/api/login` 或 `/api/register` 超过阈值（默认 10 次）。
- 预期：
  - 后续请求返回：`429 Too Many Requests`
  - 响应体：`{ "code": "RATE_LIMITED", "message": "Too many requests" }`。

---

## 2. Item 相关用例

### TC-ITEM-003 发布非法金额

- **前置**：已登录，获取 Cookie `sid`。
- **请求**  
  `POST /api/items`
- **示例 Body（非法 price = 0）**：
  ```json
  {
    "title": "item_invalid_price",
    "desc": "desc",
    "category": "cat",
    "price": 0
  }
  ```
- **预期**：
  - 状态码：`422 Unprocessable Entity`
  - 响应体：`{ "code": "VALIDATION_ERROR", ... }`（由 Bean Validation 触发）。

### 发布合法商品（供后续用例复用）

- **请求**  
  `POST /api/items`
- **示例 Body**：
  ```json
  {
    "title": "item_ok_1",
    "desc": "valid item",
    "category": "cat",
    "price": 100.00
  }
  ```
- **预期**：
  - 状态码：`201 Created`
  - 响应体：`{ "itemId": <number>, "status": "active" | "pending" }`
  - 审计日志：`action=ITEM_CREATE`。

### TC-SEARCH-004 搜索无结果

- **请求**  
  `GET /api/items?keywords=__no_such_item_keyword__&page=1&size=20`
- **预期**：
  - 状态码：`200 OK`
  - 响应体：`{ "total": 0, "items": [] }`。

### Item 管理（更新 / 下架）冒烟

- 更新：
  - `PATCH /api/items/{id}`，Body：`{ "action": "update", "payload": { "title": "new title" } }`
  - 预期：`200 { "result": "ok" }`，DB 中标题更新，审计 `ITEM_UPDATE`。

- 下架：
  - `PATCH /api/items/{id}`，Body：`{ "action": "off" }`
  - 预期：`200 { "result": "ok" }`，`status=off`，审计 `ITEM_OFF`。

---

## 3. Demand 相关用例（对称于 Items，简要）

### 发布需求

- **请求**  
  `POST /api/demands`
- **示例 Body**：
  ```json
  {
    "title": "demand_ok_1",
    "desc": "need something",
    "category": "cat",
    "expectedPrice": 50.00
  }
  ```
- **预期**：`201` + `{ "demandId", "status" }`，审计 `DEMAND_CREATE`。

### 搜索需求无结果（可选）

- `GET /api/demands?keywords=__no_such_demand_keyword__&page=1&size=20`
- 预期：`200` + `total=0`。

### 管理需求（更新 / 下架）

- 类似 Items：`PATCH /api/demands/{id}`，action=`update|off`，检查 `DEMAND_UPDATE/DEMAND_OFF` 审计记录。

---

## 4. Offer 报价相关用例

### 正常发起报价

- **前置**：
  - 卖家 A 发布 `active` 商品 itemA。
  - 买家 B 注册 & 登录。
- **请求**  
  `POST /api/offers`
- **示例 Body**：
  ```json
  {
    "targetType": "item",
    "targetId": <itemAId>,
    "amount": 80.00,
    "message": "can we make a deal?"
  }
  ```
- **预期**：
  - `201 Created`
  - `{ "offerId": <number>, "status": "created" }`
  - 审计：`OFFER_CREATE`。

### TC-OFFER-006 自报价拦截

- **前置**：
  - 用户 U 发布 `active` 商品 itemSelf（sellerId=U）。
  - U 使用自己的 Cookie 请求报价。
- **请求** （同上，`targetId=itemSelfId`）
- **预期**：
  - `403 Forbidden`
  - `{ "code": "SELF_OFFER_NOT_ALLOWED", ... }`。

---

## 5. Comment 留言相关用例

### TC-COMM-007 留言成功

- **前置**：
  - 用户 C 登录。
  - C 发布 `active` 商品 itemC。
- **请求**  
  `POST /api/comments`
- **示例 Body**：
  ```json
  {
    "targetType": "item",
    "targetId": <itemCId>,
    "content": "hello"
  }
  ```
- **预期**：
  - `201 Created`
  - `{ "commentId": <number> }`
  - 审计：`COMMENT_CREATE`。

### 列表留言

- **请求**  
  `GET /api/comments?targetType=item&targetId=<itemCId>&page=1&size=20`
- **预期**：
  - `200 OK`
  - `{ "total": 1, "comments": [ { "commentId", "userId", "content", "createdAt" } ] }`。

- 校验：`GET /api/items/{id}` 当前返回的 `comments` 字段为占位空列表（后续可扩展为聚合）。

---

## 6. NFR – 日志与追踪检查

### TraceId

- 任意请求（例如 `/api/items`）：
  - 请求头若不带 `X-Trace-Id`，响应头应包含新生成的 `X-Trace-Id`。
  - 若请求头携带自定义 `X-Trace-Id`，响应应回显相同值。

### 审计日志

- 在本地日志中检查关键操作：
  - REGISTER / LOGIN / ITEM_CREATE / ITEM_UPDATE / ITEM_OFF / DEMAND_CREATE / DEMAND_UPDATE / DEMAND_OFF / OFFER_CREATE / COMMENT_CREATE
  - 日志字段中应包含 `traceId`、`userId`、`action`（取决于日志配置是否输出 MDC）。

---

## 7. 测试策略建议

1. **自动化优先**：
   - 通过 `mvn test` 保证集成测试通过，作为 CI 的基础门槛。

2. **功能冒烟**：
   - 每次大改（或合并主干）后，用本指南快速过一遍 5–10 个关键场景。

3. **回归与扩展**：
   - 后续添加更多测试类时，按模块拆分：`auth/`, `item/`, `demand/`, `offer/`, `comment/`，沿用 `BaseIntegrationTest` 脚手架。
