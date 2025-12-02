# S6 Spring Boot 报价 Offers API

你现在作为 Spring Boot 业务规则与事务处理专家，帮助我实现 Backlog B6「报价 API（校验自报价/目标状态）」。

上下文文档：
- backend/api-spec.md 第 4 章 Offers
- backend/开发启动包.md 中关于报价约束与缺口（G5 报价 status 枚举）

前置假设：
- Items 与 Demands 的发布/详情已实现，可以根据 id 查询目标资源及其状态。
- 认证模块（B2）已提供当前登录用户信息。

请在 Spring Boot 中实现：
1. Offer 实体与 Repository：
   - 字段包含：id、targetType(item|demand)、targetId、amount、message、status（created/accepted/rejected/canceled）、buyerId、createdAt 等。
   - 使用 JPA 与 PostgreSQL 映射，并考虑与 Items/Demands 的逻辑关联（通过 targetType+targetId）。
2. 发起报价接口 POST `/api/offers`：
   - 仅允许已登录用户。
   - 校验金额 > 0，否则 400，错误码 `INVALID_AMOUNT`。
   - 校验不能对自己的商品/需求报价，否则 403，错误码 `SELF_OFFER_NOT_ALLOWED`。
   - 校验目标存在且状态可报价（active），否则 404/409 对应 `TARGET_NOT_FOUND` / `TARGET_NOT_ACTIVE`。
   - 成功时返回 201，包含 offerId 和初始 status=`created`。
3. 事务与并发：
   - 说明在服务层如何使用事务（`@Transactional`）保证读目标状态再写入报价的原子性。
   - 简要讨论并发下的状态竞态和解决策略（乐观锁/再次校验等）。
4. 预留扩展：
   - 预留接受/拒绝/撤销报价的领域方法或接口（可仅给出设计，不必完整实现）。

请输出：
- Offer 实体/Repository/Service 的设计与关键代码示例。
- `OfferController` 的接口设计与请求/响应模型。
- 对关键业务规则（自报价、目标状态校验）的实现思路说明。
