# S1 Spring Boot + PostgreSQL 数据库初始化与迁移脚本

你现在作为资深 Java/Spring 后端工程师，帮助我在 **Spring Boot** 项目中实现 Backlog B1「数据库初始化（Postgres 表/索引/迁移脚本）」。

上下文文档：
- backend/开发启动包.md 第 4 节「领域模型与数据库」
- database/db-schema.sql（可执行 DDL）
- backend/plan-backlog.md 中 B1 的描述

前置假设：
- S0 已完成：项目已经使用 Spring Boot 3 + Java 17 初始化完毕。
- 已选用 Spring Data JPA + Flyway（或你认为更合适的 Spring 生态迁移方案）。

请完成：
1. 为 Spring Boot 项目集成 PostgreSQL 与迁移工具：
   - 在 Maven/Gradle 中加入 PostgreSQL 驱动、Spring Data JPA、Flyway 相关依赖。
   - 在 `application.yml` 中配置数据源与 Flyway 基本选项（使用占位变量引用环境变量，如 `DB_URL/DB_USERNAME/DB_PASSWORD`）。
2. 将 `db-schema.sql` 中的表结构拆分或整理为 Flyway 迁移脚本：
   - 放置路径：`src/main/resources/db/migration/V1__init_schema.sql`（如有需要可拆分为多版本）。
   - 确保包含 users/items/demands/offers/comments/audit_logs 等核心表，及必要索引、外键/约束、软删字段（deleted/deleted_at）。
3. 设计并说明本地初始化流程：
   - 通过 Spring Boot 启动自动执行 Flyway 迁移，或通过命令手动触发。
   - 给出开发环境运行步骤（例如：配置环境变量 → 启动 PostgreSQL → 运行 `mvn spring-boot:run`）。
4. 提供一个简单的健康检查方案：
   - 可以是 `/actuator/health` 或自定义 `/healthz` 接口。
   - 说明如何判断数据库连接是否正常，并在日志中输出友好的诊断信息。

输出内容请包括：
- 依赖配置片段（pom.xml 或 build.gradle）
- application.yml 中与数据库/Flyway 相关的关键配置示例
- 1~2 个 Flyway 迁移脚本示例片段
- 本地初始化/迁移执行步骤说明。
