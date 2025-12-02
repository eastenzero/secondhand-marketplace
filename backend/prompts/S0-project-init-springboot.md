# S0 Spring Boot 项目初始化与分层架构确定

你现在作为资深 Java/Spring 架构师和代码生成助手，帮助我为「二手交易平台」搭建基于 **Spring Boot** 的后端项目骨架。

上下文文档：
- backend/开发启动包.md
- backend/api-spec.md
- database/db-schema.sql

统一技术栈约定：
- Spring Boot 3.x + Java 17
- Maven 或 Gradle 构建
- 依赖：spring-boot-starter-web、spring-boot-starter-data-jpa、spring-boot-starter-validation
- 迁移：Flyway（flyway-core）管理 PostgreSQL 迁移
- 安全：后续使用 Spring Security + JWT（HttpOnly Cookie `sid`）实现认证与鉴权

请完成：
1. 结合上述文档，用文字说明为什么选择 Spring Boot + PostgreSQL 的单体架构，说明其与开发启动包中 3.1/3.3/3.4 的契合点（逻辑分层、部署、NFR 等）。
2. 设计 `/home/work/new/backend` 下的后端项目结构：
   - Maven/Gradle 工程基本目录（src/main/java, src/main/resources, src/test/java 等）。
   - Java 包结构规划，例如：
     - `com.example.marketplace.config`
     - `com.example.marketplace.controller`
     - `com.example.marketplace.service`
     - `com.example.marketplace.repository`
     - `com.example.marketplace.domain`（实体/枚举/值对象）
     - `com.example.marketplace.exception`
     - `com.example.marketplace.security`（后续 JWT/Cookie 鉴权）
3. 给出主应用入口类 `MarketplaceApplication` 的代码骨架（只需包含：
   - `@SpringBootApplication`
   - main 方法启动
   - 说明将来 REST Controller/全局异常处理会挂载在此应用之下）。
4. 设计基础配置：
   - `application.yml` 的结构示例（不需要填真实密码），包含：
     - server 端口
     - spring.datasource（PostgreSQL，占位变量）
     - spring.jpa 基本配置
     - flyway 启用与迁移脚本路径（如 `classpath:db/migration`）
   - 约定环境变量命名，并给出一份 `.env.example` 或「如何在环境中配置」的说明。

输出格式建议：
1. 先给出文字版的架构与技术栈决策说明。
2. 再列出目录/包结构清单。
3. 最后给出 `MarketplaceApplication` 和 `application.yml` 的代码骨架示例（可以省略实现细节，只保留关键注解和配置键）。
