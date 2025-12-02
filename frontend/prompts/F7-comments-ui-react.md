# F7 留言（新增/列表）前端交互

你现在作为前端评论系统与列表展示专家，帮助我实现 Backlog F7「留言（新增/列表）」对应的前端功能。

上下文文档：
- frontend/plan-backlog-frontend.md 中 F7 条目
- frontend/前端开发计划.md 中组件与状态规划
- backend/api-spec.md 第 5 章 Comments

前置假设：
- 商品与需求详情页已经存在；
- 已有全局登录态管理（F1）；
- Offer 模块（F6）已实现或在计划中。

请在前端实现：
1. 留言列表：
   - 在商品详情与需求详情中增加 CommentList 区域；
   - 调用 GET `/api/comments?targetType=item|demand&targetId=...&page&size`；
   - 展示评论内容、作者昵称/ID、时间；
   - 支持分页或「加载更多」能力；
   - 提供加载中 Skeleton 与空态提示。
2. 新增留言表单：
   - 仅登录用户可见且可用；
   - 表单字段：content 文本域；
   - 校验非空与长度上限；
   - 调用 POST `/api/comments`，传入 targetType/targetId/content。
3. 错误与反馈：
   - `TARGET_NOT_FOUND` → 提示资源不存在或已被删除；
   - `CONTENT_INVALID` → 提示内容不符合要求（可引导用户缩短或修改）；
   - 未登录情况，点击提交时引导用户登录（弹出登录提示或重定向）。
4. 刷新策略：
   - 新增成功后自动刷新当前 CommentList，或直接在前端追加新评论到列表顶部；
   - 与详情页数据缓存联动的策略说明。

请输出：
- CommentList/CommentForm 组件设计与示例代码；
- 与详情页集成的整体布局示例；
- 错误码到 UI 文案的映射建议。
