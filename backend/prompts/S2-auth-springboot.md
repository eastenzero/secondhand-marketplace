# S2 Spring Boot 认证模块与用户模型（注册/登录/JWT Cookie）

你现在作为资深 Spring Security 与认证设计专家，帮助我在 **Spring Boot** 项目中实现 Backlog B2「认证模块（注册/登录、JWT Cookie、中间件）」。

上下文文档：
- backend/api-spec.md 第 1 章「认证」
- backend/开发启动包.md 关于认证、安全、删除策略等的约定
- database/db-schema.sql 中 users 表相关结构（如有）

前置假设：
- B1（数据库初始化）已完成，可以正常访问 PostgreSQL。
- 项目中已集成 Spring Data JPA、Spring Validation。

请在 Spring Boot 中实现：
1. User 实体与持久化：
   - 使用 JPA 实体类映射用户表（如 `users`），字段包含：id、username、password_hash、contact(phone/email)、角色信息（member/admin）等。
   - 编写对应的 `UserRepository`（继承 `JpaRepository` 或等价接口）。
2. 密码安全：
   - 集成 BCrypt 密码哈希（如 `BCryptPasswordEncoder`）。
   - 注册时对明文密码进行哈希，登录时校验哈希。
3. JWT 与 Cookie 会话管理：
   - 设计 JWT 载荷结构（包含 userId/username/角色/过期时间）。
   - 使用 Spring Security 过滤器或 OncePerRequestFilter：
     - 从 HttpOnly Cookie `sid` 中解析 JWT。
     - 校验签名与过期时间。
     - 将认证结果放入 Spring Security 的 `SecurityContext` 中。
4. 接口实现：
   - POST `/api/register`：
     - 按 api-spec.md 中的 JSON Schema 校验请求体（Spring Validation）。
     - 用户名被占用时返回 409，业务错误码 `USERNAME_TAKEN`。
   - POST `/api/login`：
     - 校验用户名/密码。
     - 成功时签发 JWT，并通过 HttpOnly Cookie `sid` 写回客户端，有效期 7 天，支持滑动续期。
     - 失败时返回 401，错误码 `AUTH_FAILED`。
   - POST `/api/logout`：
     - 清除 Cookie，返回 204。
5. 安全配置：
   - 使用 Spring Security 配置哪些路径匿名可访问（如 /api/login, /api/register, /healthz），哪些路径需要已认证用户。
   - 对需要登录的接口，在未认证时返回 401，错误码 `AUTH_REQUIRED`，并采用统一错误响应格式。

请输出：
- 核心类的设计说明（User 实体、Repository、Service、Controller、Security 配置、JWT 工具类/过滤器）。
- 关键代码示例（可省略细节，但要展示结构和关键注解）。
- Cookie 安全属性建议：HttpOnly, SameSite, Secure（在开发/生产环境如何配置）。
