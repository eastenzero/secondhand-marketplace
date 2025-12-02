# S8 Spring Boot 信息管理（更新/下架/软删）

你现在作为 Spring Boot 领域建模与权限控制专家，帮助我实现 Backlog B8「信息管理（更新/下架/软删）」。

上下文文档：
- backend/api-spec.md 中 Items 2.4 更新/下架 与第 3 章 Demands 的约定
- backend/开发启动包.md 中关于状态机（draft/pending/active/off/deleted）与软删的约定

前置假设：
- Items 与 Demands 的基础 CRUD 已实现。
- 认证模块可提供当前用户，且可以判断资源所有者。

请在 Spring Boot 中设计并实现：
1. 统一的状态机与权限校验：
   - 抽象出对 Item/Demand 通用的状态机逻辑（特别是 off/deleted 的语义）。
   - 抽象出资源所有权判断逻辑（当前用户是否为发布者），不在 Controller 中写重复代码。
2. Items 与 Demands 更新/下架接口：
   - PATCH `/api/items/{id}` 与 `/api/demands/{id}`：
     - 请求体 `{ action: "update|off", payload? }`。
     - 仅资源所有者可调用，否则 403，错误码 `FORBIDDEN_OWNER`。
     - `action=update` 时，根据 payload 更新允许修改的字段（如 title/desc/price/images 等）。
     - `action=off` 时，将状态置为 off，并记录时间。
3. 软删能力（可选但推荐）：
   - 提供逻辑删除（deleted + deleted_at），禁止物理硬删。
   - 确保搜索与详情接口不返回 deleted 状态的记录。
4. 错误与边界：
   - 不允许从 deleted 回到其他状态。
   - 对非法状态转移返回 409，错误码 `CONFLICT_STATE`。

请输出：
- 统一状态机与权限校验的设计（可以是服务层方法、策略类或注解）。
- Items/Demands 管理接口的控制器示例。
- 与现有搜索/详情接口的联动注意事项（例如过滤 off/deleted 的规则）。
