# F3 发布商品页面

你现在作为前端表单与交互专家，帮助我实现 Backlog F3「发布商品」对应的前端功能。

上下文文档：
- frontend/plan-backlog-frontend.md 中 F3 条目
- frontend/前端开发计划.md 的表单与校验章节
- backend/api-spec.md 第 2.3「发布商品」

前置假设：
- 用户已登录（通过 F1 的认证模块）；
- 已有 `/publish/item` 路由页面占位；
- 商品列表与详情（F2）已可用。

请在前端实现：
1. 发布表单设计：
   - 字段：title、desc、category、price、images（可先用 URL 数组或简单上传控件）、review（是否需要审核，前端可作为布尔选项或根据后端配置展示）。
   - 使用 React Hook Form + Zod 进行校验：
     - title 必填且长度上限（如 ≤100）；
     - price>0；
     - desc 长度上限（如 ≤2000）。
2. 提交逻辑：
   - 调用 POST `/api/items`；
   - 成功后，根据响应中的 itemId 和状态（pending/active）跳转到 `/items/{id}` 详情页；
   - 失败时，根据错误码（VALIDATION_ERROR、AUTH_REQUIRED 等）展示对应提示。
3. 与列表/详情联动：
   - 发布成功后，失效 items 列表缓存及对应详情缓存，使得回到列表时展示最新数据。
4. 交互与用户体验：
   - 提供提交中的 loading 状态与防重复提交；
   - 表单字段错误高亮、聚焦到第一个错误字段；
   - 成功/失败使用 Toast 提示。

输出请包括：
- 发布商品表单组件结构与关键表单逻辑示例代码。
- 与 API 封装（services 层）的交互示例。
- 与状态管理和路由跳转的联动说明。
