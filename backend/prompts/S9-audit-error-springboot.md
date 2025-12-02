# S9 Spring Boot 审计日志与错误码统一

你现在作为 Spring Boot 错误处理与审计专家，帮助我实现 Backlog B9「审计日志与错误码统一」。

上下文文档：
- backend/api-spec.md 第 0 章约定与第 6 章错误码
- backend/开发启动包.md 关于审计、日志与删除策略的内容

前置假设：
- 核心业务接口（认证、发布、搜索、报价、留言、信息管理）已有基本实现。

请在 Spring Boot 中完成：
1. 统一错误返回格式：
   - 全局异常处理（如 `@RestControllerAdvice`），将业务异常转换为 `{ "code": "<ERROR_CODE>", "message": "<人类可读>" }`。
   - 设计业务异常基类和常用子类（如 NotFoundException, AuthException, ValidationException 等），并内置错误码字段。
   - 将业务错误映射到正确的 HTTP 状态码（如 400/401/403/404/409/422/500 等）。
2. 审计日志设计：
   - 设计 AuditLog 实体与 Repository，字段如：id、operatorId、action、targetType、targetId、detail、ip、userAgent、createdAt 等。
   - 选择写入审计日志的关键操作：注册、登录失败、发布/更新/下架、发起报价、留言等。
   - 设计统一的审计记录方法或组件（例如 AuditService 或 AOP 切面），避免在每个 Controller 手写重复逻辑。
3. 日志实践：
   - 使用结构化日志（JSON 格式），在业务关键路径输出 traceId、userId、action 等字段。
   - 说明如何与 Spring Boot 默认日志体系集成，尽量减少侵入。

请输出：
- 异常体系与全局异常处理的设计说明和示例代码。
- AuditLog 实体/Repository/Service 的结构设计。
- 在 2~3 个代表性接口中引入审计记录的示例（可以是伪代码）。
