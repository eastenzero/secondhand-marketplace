# F1 认证（登录/注册）页面与流程

你现在作为资深前端工程师，帮助我实现 Backlog F1「认证（登录/注册）」对应的前端部分。

上下文文档：
- frontend/plan-backlog-frontend.md 中 F1 条目
- frontend/前端开发计划.md 中路由与页面部分
- backend/api-spec.md 第 1 章 认证

前置假设：
- F0 已完成，已有 React + TS + Vite 项目骨架与基本路由；
- 已存在 /login 与 /register 路由占位页面。

请在前端实现：
1. 登录页 `/login`：
   - 使用 React Hook Form + Zod（或你推荐的方案）实现表单校验：
     - username 3~50 字符；password ≥ 6 字符。
   - 使用 Axios 调用后端 POST `/api/login`：
     - 处理 200 成功（后端通过 HttpOnly Cookie 维护会话），前端保存最小必要的用户状态（如 username、角色等）。
     - 处理 401 `AUTH_FAILED`，展示友好错误信息。
   - 登录成功后，根据跳转来源或默认路由（如 /items）重定向。
2. 注册页 `/register`：
   - 表单字段：username、password、contact.email（可选）、contact.phone（可选）。
   - 使用同一套表单验证与错误展示模式；
   - 调用 POST `/api/register`，处理：
     - 201 成功 → 可以选择自动跳转到 /login 或自动登录。
     - 409 `USERNAME_TAKEN` → 展示「用户名已被占用」的错误提示。
3. 登录态管理与守卫：
   - 设计一个简单的 auth store（Zustand/Redux），保存：isAuthenticated、userInfo、loading 状态等；
   - 从后端接口或本地缓存恢复登录态的策略；
   - 受保护路由守卫组件（如 `<RequireAuth>`），未登录访问受保护页面时跳转 /login 并带上 `redirect` 参数。
4. 全局错误与 Toast：
   - 为登录/注册请求接入统一的错误处理（Axios 拦截器或封装）。
   - 使用全局 Toast 组件显示成功/失败信息。

输出内容请包括：
- 页面组件结构设计（LoginPage/RegisterPage），关键表单与提交逻辑代码示例。
- auth store 的基本设计（state、actions）。
- 受保护路由守卫的实现方式示例。
- 与后端错误码（AUTH_FAILED, USERNAME_TAKEN 等）映射到前端文案的建议。
