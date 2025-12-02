# F5 需求列表/详情/发布页面

你现在作为前端领域对称性与复用专家，帮助我实现 Backlog F5「需求列表/详情/发布」对应的前端功能。

上下文文档：
- frontend/plan-backlog-frontend.md 中 F5 条目
- frontend/前端开发计划.md 中路由与组件设计
- backend/api-spec.md 第 3 章 Demands

前置假设：
- F2/F3 已实现商品列表/详情/发布，对应的组件与状态管理已可复用；
- 已有 /demands、/demands/:id、/publish/demand 路由占位。

请在前端实现：
1. 需求列表页 `/demands`：
   - 复用或基于 Item 列表页实现 Demand 列表（DemandCard），字段基本对称（标题/期望价格/分类等）；
   - 支持与商品类似的搜索/筛选/分页逻辑（可重用 F4 中的组件与逻辑）。
2. 需求详情页 `/demands/:id`：
   - 调用 GET `/api/demands/{id}`；
   - 展示需求详情，并为后续报价/留言预留区域（与商品详情保持一致体验）。
3. 发布需求页 `/publish/demand`：
   - 参考发布商品表单实现发布需求表单（字段 title/desc/category/expected_price/images 等）；
   - 使用相同的表单与校验模式；
   - 成功后跳转到对应详情页。
4. 复用与抽象：
   - 抽取通用的列表卡片/表单组件（如 BaseListingForm、ListingCard），由商品和需求复用；
   - 抽取共享的 Hook（如 `useListingList`, `useListingDetail`）或服务层函数。

请输出：
- Demands 列表/详情/发布页面的组件结构与路由设计；
- 复用的组件/Hook/服务封装示例；
- 与商品端保持体验对称性的一些注意事项和建议。
