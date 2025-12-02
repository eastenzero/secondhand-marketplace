# 后端组件开发状态与后续工作说明（MVP 完成度）

本文档用于说明当前 Spring Boot 后端在各个模块上的 **完成度** 与 **后续可选工作**，帮助后续开发者或评审快速理解哪些能力已达到 MVP，哪些是推荐增强项。

---

## 1. 认证与授权（Auth）

**已完成：**

- 注册接口 `POST /api/register`：
  - 字段校验 & 错误码：`USERNAME_TAKEN`、`VALIDATION_ERROR`。
  - 成功返回 `userId`。
  - 使用 BCrypt 存储密码，默认角色 MEMBER，状态 active。
  - 写入审计日志：`REGISTER` / `REGISTER_FAILED`。
- 登录接口 `POST /api/login`：
  - 正确的用户名+密码生成 JWT，并通过 HttpOnly Cookie `sid` 返回。
  - 错误凭证：`AUTH_FAILED`（401）。
  - 写审计日志：`LOGIN` / `LOGIN_FAILED`。
- 登出接口 `POST /api/logout`：
  - 清除 sid Cookie。
- 安全配置：
  - 匿名访问：`/api/register`, `/api/login`, `GET /api/items/**`, `GET /api/demands/**`, `/actuator/health`。
  - 其余接口默认需要登录。

**可选增强 / 后续工作：**

- 支持用户状态（disabled）时登录限制与错误码。
- 引入角色区分（如 ADMIN）并在部分管理接口增加基于角色的授权控制。

---

## 2. Items 模块（商品）

**已完成：**

- 实体与 Repository：
  - `Item` 与 `items` 表映射（status/createdAt/updatedAt/deletedAt 等）。
  - `ItemRepository.searchActiveItems` 仅查询 `status='active'`，支持关键词/分类/价格区间分页搜索。
- 接口：
  - `GET /api/items`：搜索，游客可用。错误码 `INVALID_RANGE` 等。
  - `GET /api/items/{id}`：详情，返回 `item` 基础信息以及占位的 `offers: []`, `comments: []`。
    - deleted 状态视为 NOT_FOUND。
  - `POST /api/items`：发布商品，需要登录。根据 `app.review.enabled` 决定初始状态 `pending` 或 `active`。
  - `PATCH /api/items/{id}`：信息管理：
    - `action="update"`：允许更新标题/描述/分类/价格/图片/成色。
    - `action="off"`：下架，`status` 置为 off。
    - 仅 sellerId == 当前用户可操作，否则 `FORBIDDEN_OWNER`。
    - deleted 状态不允许继续管理 → `CONFLICT_STATE`。
- 审计：
  - `ITEM_CREATE`, `ITEM_UPDATE`, `ITEM_OFF`。

**当前限制 / 待定点：**

- 详情接口暂不聚合 Offers/Comments，仅返回空列表占位。

**可选增强 / 后续工作：**

- 在 `getItemDetail` 中调用 Offer/Comment 查询，聚合最近 N 条数据。
- 管理接口支持 `action="delete"`，执行软删（`status=deleted` + `deletedAt`）。
- 针对搜索接口增加缓存或更精细的索引策略。

---

## 3. Demands 模块（需求）

**已完成：**

- 实体与 Repository：对称于 Items，映射 `demands` 表。
- 接口：
  - `GET /api/demands`：搜索 active 需求，游客可用。
  - `GET /api/demands/{id}`：详情，同样返回占位 `offers: []`, `comments: []`，deleted 视为 NOT_FOUND。
  - `POST /api/demands`：发布需求，需要登录。
  - `PATCH /api/demands/{id}`：
    - `update` / `off` 行为与 Items 对称。
    - 所有权基于 `buyerId`，非持有者返回 `FORBIDDEN_OWNER`。
- 审计：`DEMAND_CREATE`, `DEMAND_UPDATE`, `DEMAND_OFF`。

**可选增强 / 后续工作：**

- 同 Items，详情接口聚合 Offers/Comments。
- 支持逻辑删除 action。

---

## 4. Offers 模块（报价）

**已完成：**

- 实体 `Offer` 与 `offers` 表：
  - `targetType`（item|demand）、`targetId`、`offererId`、`amount`、`status`（created 等）。
- 接口：
  - `POST /api/offers`：
    - 登录用户可发起报价。
    - 校验：
      - `amount > 0` → 否则 `INVALID_AMOUNT` (400)。
      - target 存在且为 active → 否则 `TARGET_NOT_FOUND` (404) / `TARGET_NOT_ACTIVE` (409)。
      - 自报价（对自己发布的 item/demand 报价） → `SELF_OFFER_NOT_ALLOWED` (403)。
    - 成功：`201 { "offerId", "status": "created" }`。
- 审计：`OFFER_CREATE`。

**明确未做 / 将来可扩展：**

- 报价生命周期后续操作（接受/拒绝/取消）尚未实现：
  - 例如 `PATCH /api/offers/{id}` with action=`accept|reject|cancel`。
  - 未处理报价状态与 Item/Demand 状态联动。

**建议后续工作：**

- 定义 Offer 状态机与权限：只有目标资源持有者可接受/拒绝，报价发起者可取消。
- 可能需要引入乐观锁或状态检查，避免并发修改冲突。

---

## 5. Comments 模块（留言）

**已完成：**

- 实体 `Comment` 与 `comments` 表：通过 `targetType+targetId` 关联到 Item/Demand。
- 接口：
  - `POST /api/comments`：
    - 登录用户可留言。
    - 校验目标存在，否则 `TARGET_NOT_FOUND`。
    - 校验内容非空且长度合理，否则 `CONTENT_INVALID`。
    - 成功：`201 { "commentId" }`。
  - `GET /api/comments?targetType=item&targetId=1&page=1&size=20`：
    - 游客可用。
    - 按时间倒序分页返回 `{ total, comments:[...] }`。
- 审计：`COMMENT_CREATE`。

**当前限制：**

- Item/Demand 详情接口中仅返回空的 comments 列表，占位用。

**可选增强：**

- 在详情接口聚合最近 N 条评论。
- 支持留言编辑/删除（可能涉及角色和审核机制）。

---

## 6. 状态机、权限与软删

**已完成：**

- `ItemStatus`：`draft/pending/active/off/deleted`，用于 Item 与 Demand。
- 权限校验集中在 `ListingPermissionService`：
  - `requireCurrentUserId()` 获取当前用户 ID 或抛 `AUTH_REQUIRED`。
  - `assertItemOwner` / `assertDemandOwner` 统一判断资源所有者。
- 软删字段：`deleted_at` 已存在，且：
  - 详情接口对 `status=deleted` 的记录返回 `NOT_FOUND`。
  - 搜索接口只查 `status=active`，自然排除 off/deleted。

**未完全落地的点：**

- 未提供显式 "delete" 动作（只支持 update/off）。
- 未限制 off 状态的详情访问（当前 off 资源仍可通过直链查看）。

**后续建议：**

- 视产品需求决定：
  - 是否需要业务上的“删除（软删）”动作。
  - off 状态是否对非 owner 隐藏详情（例如仅 owner 可见）。

---

## 7. 错误处理与错误码

**已完成：**

- 统一错误响应格式：`{ "code", "message" }`。
- `BusinessException + ErrorCode` 体系，`GlobalExceptionHandler` 映射常见业务错误到 HTTP 状态：
  - 401：`AUTH_REQUIRED`, `AUTH_FAILED`
  - 403：`FORBIDDEN_OWNER`, `SELF_OFFER_NOT_ALLOWED`
  - 404：`NOT_FOUND`, `TARGET_NOT_FOUND`
  - 409：`TARGET_NOT_ACTIVE`, `CONFLICT_STATE`
  - 400：`INVALID_RANGE`, `INVALID_AMOUNT`
  - 422：`CONTENT_INVALID`, `VALIDATION_ERROR`
  - 429：`RATE_LIMITED`

**后续扩展空间：**

- 按异常类型细分（`AuthException`, `NotFoundException`, `ValidationException`）在业务中更明确地使用，以利于可读性和监控聚合。

---

## 8. 审计日志与可观测性

**已完成：**

- `AuditLog` 实体 + `AuditLogRepository` + `AuditService`：
  - 记录 actorUserId、action、entityType、entityId、IP、message 等。
  - 在 REGISTER/LOGIN/ITEM_CREATE/ITEM_UPDATE/ITEM_OFF/DEMAND_CREATE/DEMAND_UPDATE/DEMAND_OFF/OFFER_CREATE/COMMENT_CREATE 等关键路径打点。
- TraceId：
  - `TraceIdFilter` 为每个请求生成/透传 `X-Trace-Id`，并放入 MDC。
- 健康检查：
  - Spring Boot Actuator `/actuator/health` 已启用并在安全配置中放行。

**尚未实现但推荐的 NFR 能力：**

- Prometheus 指标：
  - 尚未引入 micrometer-prometheus 依赖与 `/actuator/prometheus` 端点。
  - 推荐后续添加用于请求耗时、错误率、QPS 监控。
- 统一结构化 JSON 日志：
  - 目前日志格式依赖默认 Logback 配置。
  - 推荐在生产配置中使用 JSON encoder，将 `traceId/userId/action` 等 MDC 字段输出。

---

## 9. 测试与质量保障

**已完成：**

- 基础集成测试脚手架：
  - `BaseIntegrationTest` 统一提供 MockMvc、用户创建与登录 Cookie 辅助、限流 reset。
- 代表性用例覆盖：
  - 注册成功、登录失败（AUTH_FAILED）。
  - 商品非法价格校验、搜索无结果。
  - 自报价拦截（SELF_OFFER_NOT_ALLOWED）。
  - 留言成功并可列表查询。

**后续建议：**

- 增加更多边界测试：
  - 分页边界（page/size 小于 1，大于最大限制）。
  - 价格区间非法组合（minPrice > maxPrice）。
  - 对 off/deleted 状态的访问和管理进行回归测试。
- 逐步引入 Testcontainers PostgreSQL 以避免测试环境和生产环境差异。

---

## 10. 总结

- 当前后端已根据 S0–S10 提示词完成 **MVP 主流程与主要非功能基线**：
  - 核心 API 均有实现并接入统一认证、错误处理与部分审计。
  - 日志、traceId、简单限流、健康检查具备基础能力。
- 仍存在若干 **设计上预留但未完全落地** 的增强项：
  - 详情聚合 Offers/Comments。
  -软删 delete 动作及更严格的状态机控制。
  - 更丰富的监控指标与结构化日志输出。
  - 更全面的集成/边界测试与测试环境标准化。

这些增强可根据后续产品优先级和运维要求，逐步在现有架构上平滑演进，无需大规模重构。
