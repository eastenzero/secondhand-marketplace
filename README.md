# 二手交易平台（secondhand-marketplace）

一个基于 Spring Boot + React + PostgreSQL 的二手交易平台，用于完成课程设计的 **MVP 功能实现**，并对齐前期的需求分析、DFD、OOA、数据库与 API 设计文档。

后端负责用户认证、商品/需求管理、报价、留言与基础审计日志；前端提供注册登录、列表与详情浏览、发布与管理等交互界面。

---

## 功能概览（MVP）

- **用户与认证**
  - 注册 / 登录 / 退出；基于 JWT（HttpOnly Cookie `sid`）。
  - 角色：默认 `MEMBER`，预留 `ADMIN` 能力。
- **商品 Items**
  - 商品发布、搜索、详情查看。
  - 上下架管理（`draft/pending/active/off/deleted` 状态机）。
- **需求 Demands**
  - 与商品对称的“求购信息”发布、搜索与管理。
- **报价 Offers**
  - 对商品或需求发起报价；校验金额>0、目标有效、禁止自报价。
- **留言 Comments**
  - 针对商品/需求的留言与列表查询。
- **数据库与审计**
  - PostgreSQL 15，含 users/items/demands/offers/comments/orders 等表结构。
  - 关键操作写入审计日志，支持后续追踪。

更详细的接口说明见 `backend/api-spec.md`，数据库 DDL 见 `database/db-schema.sql`。

---

## 技术栈

- **后端 Backend**
  - Java 17, Spring Boot 3.2
  - Spring Web / Validation / Data JPA / Security / Actuator
  - Flyway 数据库迁移
  - PostgreSQL 驱动
  - JWT（jjwt）认证

- **前端 Frontend**
  - React 18 + TypeScript + Vite
  - React Router v6
  - 状态管理：Zustand
  - 表单与校验：React Hook Form + Zod
  - UI：TailwindCSS + Radix UI 组件 + Lucide 图标

- **数据库与文档**
  - PostgreSQL 15
  - SQL DDL：`database/db-schema.sql`
  - 需求/DFD/OOA/架构等文档（Markdown + Mermaid 图 + Word 模板）。

---

## 目录结构

```text
.
├── backend/                    # Spring Boot 后端服务
│   ├── pom.xml                 # Maven 配置
│   ├── src/main/java/com/example/marketplace/
│   ├── src/main/resources/
│   │   └── application.yml     # 应用与数据库配置
│   ├── api-spec.md             # API 规范（MVP）
│   ├── backend-components-status.md   # 后端模块完成度说明
│   ├── backend-testing-guide.md       # 后端测试说明
│   └── 开发启动包.md            # 后端开发启动/架构说明
├── frontend/                   # React + Vite 前端工程
│   ├── package.json            # 前端依赖与脚本
│   ├── vite.config.ts          # Vite 与 /api 代理配置
│   ├── src/
│   │   ├── main.tsx            # 前端入口
│   │   ├── router.tsx          # 路由与页面映射
│   │   ├── pages/              # 业务页面
│   │   ├── components/         # 通用组件与布局
│   │   └── services/stores/... # API 客户端与状态管理
│   ├── frontend-gap-analysis.md      # 前端进度与差距分析
│   └── 前端开发计划.md                # 前端开发计划（MVP）
├── database/
│   ├── db-schema.sql           # PostgreSQL 数据库 DDL
│   └── db-design-prompt.md     # 数据库设计提示与约束
├── images/                     # DFD 图等分析用图片
├── 二手交易平台_结构化需求分析_export.md
├── 实验四 面向对象的软件分析.md/
├── 开发建议顺序.md                 # 整体开发建议顺序
├── 模板结构提取.md                 # 与课程论文模板对齐的结构骨架
├── 课程设计报告草稿.md             # 课程设计文稿（Markdown）
└── 软件工程课程设计论文模板.docx   # 提交模板
```

---

## 环境准备

- **必需**
  - JDK 17+
  - Maven 3.8+
  - Node.js 18+（推荐）
  - PostgreSQL 15（或兼容版本）

- **可选工具**
  - IDE：IntelliJ IDEA / VS Code
  - API 调试：Postman / curl

---

## 数据库初始化

默认配置见 `backend/src/main/resources/application.yml`：

- JDBC URL：`jdbc:postgresql://localhost:5432/marketplace`
- 用户名：`marketplace`
- 密码：`change-me`

你可以按照以下方式初始化本地数据库（示例）：

```bash
# 登录 PostgreSQL 后执行，例如：psql -U postgres
CREATE USER marketplace WITH PASSWORD 'change-me';
CREATE DATABASE marketplace OWNER marketplace;
GRANT ALL PRIVILEGES ON DATABASE marketplace TO marketplace;
```

后端启动时会通过 **Flyway** 执行 `classpath:db/migration` 中的迁移脚本。对于完整表结构与索引说明，可以参考：

- `database/db-schema.sql`

---

## 启动后端（Spring Boot）

```bash
cd backend

# 安装依赖并启动（需要已安装 Maven）
mvn spring-boot:run

# 或在 IDE 中运行主类：
# com.example.marketplace.MarketplaceApplication
```

- 默认端口：`http://localhost:8080`
- 健康检查：`/actuator/health`

---

## 启动前端（React + Vite）

前端通过 Vite dev server 运行，并将 `/api` 代理到本地后端：

- 代理目标：`http://localhost:8080`（见 `frontend/vite.config.ts`）

启动步骤：

```bash
cd frontend

npm install
npm run dev
```

启动后访问：`http://localhost:5173`

---

## 常用脚本

### 后端

```bash
cd backend

# 运行测试
mvn test

# 构建可执行 JAR
mvn clean package
```

### 前端

```bash
cd frontend

# 本地开发
npm run dev

# 生产构建
npm run build

# 启动本地预览
npm run preview
```

更多测试与质量说明见 `backend/backend-testing-guide.md` 与前端目录下相关文档。

---

## 设计与文档索引

- **需求与分析**
  - `二手交易平台_结构化需求分析_export.md`
  - `实验四 面向对象的软件分析.md/`
- **数据库设计**
  - `database/db-design-prompt.md`
  - `database/db-schema.sql`
- **后端设计与状态**
  - `backend/开发启动包.md`
  - `backend/api-spec.md`
  - `backend/backend-components-status.md`
  - `backend/backend-testing-guide.md`
- **前端规划与进度**
  - `frontend/前端开发计划.md`
  - `frontend/frontend-gap-analysis.md`
  - `frontend/plan-backlog-frontend.md`

---

## 说明

本仓库主要服务于课程设计与教学目的，重点展示：

- 从需求/DFD/OOA → 数据库 → API → 前后端实现的一致性。
- 如何在有限时间内完成一个可运行的二手交易平台 MVP。

如需继续演进，可优先考虑：

- 订单/支付闭环、通知与聊天、后台管理与风控等增强模块。
- 更完善的监控、日志与自动化测试。
