# S5 Spring Boot 需求 Demands API（发布/详情/搜索）

你现在作为领域建模与代码复用专家，帮助我在 Spring Boot 项目中实现 Backlog B5「需求发布/详情/搜索 API」，并尽量与商品 Items 逻辑对称、复用通用组件。

上下文文档：
- backend/api-spec.md 第 3 章 Demands
- backend/开发启动包.md 中关于商品/需求对称性的说明

前置假设：
- Items 的发布/详情/搜索（B3/B4）已实现，并有可复用的状态枚举、分页工具等。

请在 Spring Boot 中实现：
1. Demand 实体与 Repository：
   - 字段设计与 Item 对称（title/desc/category/price/status/ownerId 等）。
   - 复用状态枚举和软删逻辑（draft/pending/active/off/deleted）。
2. 接口实现：
   - GET `/api/demands`：搜索，查询参数与 Items 搜索一致，返回结构 `{ total, demands: [...] }` 或 `{ total, items: [...] }`（根据 api-spec 约定）。
   - GET `/api/demands/{id}`：详情，游客可访问。
   - POST `/api/demands`：发布，需登录用户，校验请求体验证规则与 Items 对齐。
3. 复用设计：
   - 抽取通用分页与过滤逻辑，避免 Items 与 Demands 重复代码。
   - 抽取共享的状态枚举、基础领域模型/基类或接口（如 `AbstractListing`）。
4. 错误与校验：
   - 保证与 Items 相同的错误码和 HTTP 状态表现（NOT_FOUND、VALIDATION_ERROR 等）。

请输出：
- Demand 实体/Repository/Service 的设计说明。
- 与 Items 共享的组件/工具/枚举清单。
- 控制器层的接口设计与示例代码。
