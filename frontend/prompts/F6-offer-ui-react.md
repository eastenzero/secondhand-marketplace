# F6 发起报价前端交互

你现在作为前端交互与状态联动专家，帮助我实现 Backlog F6「发起报价」对应的前端功能。

上下文文档：
- frontend/plan-backlog-frontend.md 中 F6 条目
- frontend/前端开发计划.md 中互动闭环阶段说明
- backend/api-spec.md 第 4 章 Offers

前置假设：
- 详情页（商品与需求）已具备基本展示；
- 用户登录态（F1）与 Items/Demands 详情（F2/F5）已可用。

请在前端实现：
1. 报价入口与弹窗：
   - 在商品详情 `/items/:id` 和需求详情 `/demands/:id` 页面中增加「发起报价」按钮；
   - 点击后打开对话框/侧滑面板（OfferDialog），包含金额输入与可选留言 message 字段。
2. 表单与校验：
   - 校验 amount>0（前端）；
   - 使用表单库统一管理错误展示；
   - 禁止自报价：当当前用户为资源所有者时，在 UI 层可以提前禁用按钮并提示原因（即便如此仍依赖后端校验）。
3. 请求与错误处理：
   - 调用 POST `/api/offers`，传入 targetType（item|demand）、targetId、amount、message；
   - 处理后端错误：
     - `INVALID_AMOUNT` → 金额错误提示；
     - `SELF_OFFER_NOT_ALLOWED` → 明确提示「不能给自己的商品/需求报价」；
     - `TARGET_NOT_ACTIVE`/`TARGET_NOT_FOUND` → 提示资源状态问题，建议刷新页面。
4. 与详情页联动：
   - 报价成功后，刷新当前详情页的数据（以便将来在详情中展示最新报价列表）；
   - 使用 Toast 提示成功状态，并关闭弹窗。

请输出：
- OfferDialog 组件结构与调用方式示例；
- 与详情页集成的交互流程（按钮 → 弹窗 → 请求 → 刷新）；
- 针对错误码的 UI 文案映射建议。
