# S7 Spring Boot 留言 Comments API

你现在作为 Spring Boot REST 设计与数据建模专家，帮助我实现 Backlog B7「留言 API（新增/列表）」。

上下文文档：
- backend/api-spec.md 第 5 章 Comments
- backend/开发启动包.md 中关于留言实体与用例的一致性说明

前置假设：
- Items 与 Demands 已实现详情接口。
- 认证模块已可提供当前用户信息。

请在 Spring Boot 中实现：
1. Comment 实体与 Repository：
   - 字段包含：id、targetType(item|demand)、targetId、userId、content、createdAt 等。
   - 通过 targetType+targetId 与 Items/Demands 进行逻辑关联。
2. 接口实现：
   - POST `/api/comments`：
     - 需登录。
     - 校验目标资源存在，否则 404，错误码 `TARGET_NOT_FOUND`。
     - 校验内容非空且长度合理，否则 422，错误码 `CONTENT_INVALID`。
     - 成功时返回 201，包含 commentId。
   - GET `/api/comments?targetType=item&targetId=1&page=1&size=20`：
     - 游客可访问。
     - 按时间倒序分页返回 `{ total, comments:[...] }`。
3. 与详情接口的集成：
   - 说明如何在 `GET /api/items/{id}` 与 `GET /api/demands/{id}` 中聚合留言列表：
     - 当前步骤可以只在 Comments 模块中实现接口，由详情模块在后续步骤中调用或聚合。
4. 校验与错误处理：
   - 使用 Spring Validation 对请求体验证。
   - 使用统一错误格式 `{code,message}` 返回业务错误码。

请输出：
- Comment 实体/Repository/Service 的设计说明。
- Comments 控制器的接口设计与示例代码。
- 与 Items/Demands 详情聚合的推荐做法（同步查询/懒加载/独立前端请求等）。
