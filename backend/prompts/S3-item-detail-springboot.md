# S3 Spring Boot 商品发布与详情 API

你现在作为 Spring Boot REST 设计与领域建模专家，帮助我在后端中实现 Backlog B3「商品发布/详情 API」。

上下文文档：
- backend/api-spec.md 第 2 章 Items（2.2 查看详情、2.3 发布商品）
- backend/开发启动包.md 中关于商品/需求状态机与删除策略的说明

前置假设：
- B1（数据库）与 B2（认证）已实现：
  - 可访问 PostgreSQL，并有基础表结构。
  - 通过 Spring Security + JWT Cookie 获取当前登录用户。

请使用 Spring Boot + Spring Data JPA 实现：
1. Item 领域模型与持久化：
   - 定义 JPA 实体 Item，字段示例：id、title、desc、category、price、images（可先用 JSON 字符串或简单表结构）、status、sellerId、createdAt、updatedAt、deleted/deletedAt 等。
   - 设计状态枚举：draft/pending/active/off/deleted，并与文档中的状态机保持一致。
   - 定义 `ItemRepository`，支持按 id/卖家/状态等查询。
2. 发布商品接口 POST `/api/items`：
   - 仅允许已登录用户。
   - 按 api-spec.md 中的请求结构校验 payload（Spring Validation）。
   - 根据配置 `review.enabled` 决定初始状态：
     - 关闭时直接 active；
     - 开启时为 pending，后续由管理端审核。
   - 返回包含 itemId 与当前状态的响应。
3. 商品详情接口 GET `/api/items/{id}`：
   - 游客可访问。
   - 基本返回结构：`{ item, offers:[], comments:[] }`。
   - 当前步骤可先只返回 item 与空数组；真正的 offers/comments 聚合由 B6/B7 完成后补齐。
4. 基础错误处理：
   - 找不到资源时返回 404，错误码 `NOT_FOUND`。
   - 若后续需要所有权校验（如更新/删除），预留相应的服务层方法和异常类型。

请输出：
- Item 实体的字段与注解设计说明。
- `ItemService` 的主要方法设计（如 createItem, getItemDetail）。
- `ItemController` 的 Spring MVC 映射示例，包括请求/响应模型。
- 对 images 字段和审核开关（review.enabled）的当前实现策略和后续扩展建议。
