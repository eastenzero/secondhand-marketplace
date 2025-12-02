# F2 商品列表与详情页面

你现在作为前端页面与状态管理专家，帮助我实现 Backlog F2「商品列表/详情」对应的前端部分。

上下文文档：
- frontend/plan-backlog-frontend.md 中 F2 条目
- frontend/前端开发计划.md 中路由与页面映射
- backend/api-spec.md 第 2 章 Items

前置假设：
- 项目骨架与路由（F0）已完成；
- 认证（F1）已具备基础登录态管理；
- 已有 /items 与 /items/:id 路由页面占位。

请在前端实现：
1. 商品列表页 `/items`：
   - 使用 Axios 调用 GET `/api/items`，初始请求不带筛选参数；
   - 展示列表卡片（ItemCard）：标题、价格、状态（active）、简要描述；
   - 提供基础加载状态（Skeleton）与空态展示。
2. 商品详情页 `/items/:id`：
   - 调用 GET `/api/items/{id}`；
   - 展示商品详情信息；
   - 为后续报价与留言模块预留区域（例如报价按钮、留言列表区域），当前可使用占位组件或空列表。
3. 数据缓存与状态管理：
   - 设计 items 列表与详情的缓存结构（如 `items.list`, `items.detail[id]`）；
   - 定义失效策略（在后续 F3 发布成功后需要刷新列表/详情）。
4. 错误与边界处理：
   - 处理 404 `NOT_FOUND`，展示「商品不存在或已下架」页面或提示。
   - 处理网络错误/超时，通过全局错误提示与重试按钮。

输出请包括：
- 列表与详情页面的组件结构设计（包含 ItemCard/ItemDetailPanel 等）。
- 与后端 API 的请求封装示例（services 层）。
- 状态管理方案与缓存 key 设计示例。
