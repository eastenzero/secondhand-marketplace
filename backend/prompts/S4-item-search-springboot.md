# S4 Spring Boot 商品搜索 API（分页与筛选）

你现在作为 Spring Boot + JPA 查询优化专家，帮助我实现 Backlog B4「搜索商品 API（分页/筛选）」。

上下文文档：
- backend/api-spec.md 第 2.1「搜索商品」
- backend/开发启动包.md 中关于索引与性能的建议（items(category) WHERE status='active' 等）

前置假设：
- Item 实体与基础持久化已在 B3 中实现。

请设计并实现 Spring Boot 版本的商品搜索：
1. 接口定义：
   - GET `/api/items?keywords&category&minPrice&maxPrice&page=1&size=20`
   - 使用 Spring MVC 绑定查询参数，设计默认值与最大页大小限制（防止恶意大页）。
2. 查询语义：
   - 仅返回 status='active' 的商品。
   - `keywords` 对 title/desc 做模糊匹配（可用 ILIKE 或 JPA Specification）。
   - `category` 精确匹配。
   - `minPrice/maxPrice` 为价格区间过滤，非法区间时返回 400，错误码 `INVALID_RANGE`。
3. 分页与返回：
   - 使用 Spring Data 的分页（Pageable/Page）或等价方案。
   - 返回 `{ total, items: [...] }` 结构，与 api-spec 对齐。
4. 性能与索引建议：
   - 说明在 items 表上应该建立哪些索引（如 category/status/created_at 的复合或局部索引）。
   - 在 Flyway 迁移脚本中如何表达这些索引。

请输出：
- 服务层搜索方法设计（参数列表、返回类型）。
- 控制器层的接口签名与示例代码。
- 查询实现方案（JPA 方法名查询、Specification、QueryDSL 或原生 SQL）的选择理由。
- 对索引与性能的文字说明，并给出 1~2 个索引 DDL 示例片段。
