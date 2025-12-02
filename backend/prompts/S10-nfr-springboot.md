# S10 Spring Boot 非功能基线（限流/日志/监控与测试）

你现在作为 Spring Boot 性能与可观测性专家，帮助我实现 Backlog B10「非功能基线（限流/日志/监控埋点）」并与测试计划结合。

上下文文档：
- backend/开发启动包.md 第 3.4「非功能性需求」、第 6 节「测试计划与质量」
- backend/api-spec.md 中对错误码和安全的约定

前置假设：
- 核心业务功能（B1~B9）已基本可用。

请在 Spring Boot 中设计和实现：
1. 日志与追踪：
   - 使用结构化日志（JSON），为每个请求打 traceId（可通过过滤器或拦截器生成并放入 MDC）。
   - 在认证、发布、报价、留言等关键路径输出简洁但有用的日志（避免记录敏感信息）。
2. 限流：
   - 为登录/注册等接口实现简单的基于 IP 的限流方案（可在内存中或用 Guava/Resilience4j 等实现）。
   - 说明如果将来要扩展到分布式限流（如 Redis + Lua），体系上需要做哪些调整。
3. 监控与健康检查：
   - 提供 `/healthz` 或利用 Spring Boot Actuator 的健康检查端点。
   - 设计基础指标：请求耗时、错误率、关键接口 QPS 等，并说明如何接入 Prometheus/Grafana（可只给出配置思路）。
4. 测试脚手架：
   - 使用 Spring Boot Test / MockMvc 或 WebTestClient，为关键用例编写示例测试：
     - TC-REG-001 注册成功
     - TC-AUTH-002 登录失败
     - TC-ITEM-003 发布非法金额
     - TC-SEARCH-004 搜索无结果
     - TC-OFFER-006 自报价拦截
     - TC-COMM-007 留言成功
   - 说明如何组织测试包结构和测试数据初始化（如 Testcontainers/内存数据库/嵌入式 PostgreSQL 等）。

请输出：
- 日志/traceId 过滤器或配置的设计与示例代码。
- 简单限流实现的思路与关键代码片段。
- 健康检查与 Actuator 配置示例。
- 2~3 个代表性测试用例骨架示例。
