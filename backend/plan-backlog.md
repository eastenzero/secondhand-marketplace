# 实施计划与任务清单（MVP）

## 1. 范围（MVP）
- 注册/登录
- 商品/需求发布、搜索与详情
- 报价、留言
- 信息管理（更新/下架）
- 日志与基础审计

## 2. Backlog（按业务价值与依赖排序）

| ID | 工作项 | 类型 | 价值 | 依赖 | 预估 |
| --- | --- | --- | --- | --- | --- |
| B1 | 数据库初始化（Postgres 表/索引/迁移脚本） | Tech | 高 | - | 2d |
| B2 | 认证模块（注册/登录、JWT Cookie、中间件） | Feat | 高 | B1 | 3d |
| B3 | 商品发布/详情 API | Feat | 高 | B1,B2 | 3d |
| B4 | 搜索商品 API（分页/筛选） | Feat | 高 | B1 | 2d |
| B5 | 需求发布/详情/搜索 API | Feat | 中 | B1,B2 | 3d |
| B6 | 报价 API（校验自报价/目标状态） | Feat | 高 | B1,B2,B3/B5 | 3d |
| B7 | 留言 API（新增/列表） | Feat | 高 | B1,B2,B3/B5 | 2d |
| B8 | 信息管理（更新/下架/软删） | Feat | 中 | B1,B2,B3/B5 | 3d |
| B9 | 审计日志与错误码统一 | Tech | 中 | B2 | 2d |
| B10 | 非功能基线（限流/日志/监控埋点） | Tech | 中 | B2 | 2d |

## 3. Sprint 计划（1-2周/迭代）
- Sprint 1（两周）：B1-B4，交付可搜索与发布的商品主流程（含注册/登录）
- Sprint 2（两周）：B5-B8，补齐需求、报价、留言与信息管理
- 硬化（1周）：B9-B10，测试/性能基线与收尾

## 4. 里程碑
- M1：数据库可用（DDL 执行）
- M2：认证与会话可用（登录可获取 Cookie）
- M3：商品主流程可演示（发布/搜索/详情）
- M4：互动闭环可演示（报价/留言）
- M5：验收（功能+非功能基线通过）

## 5. 风险与假设

### 5.1 风险（含缓解与阻断条件）
| 风险 | 影响 | 缓解/备选 | 阻断条件 |
| --- | --- | --- | --- |
| 认证实现复杂/安全性不足 | 高 | 采用业界库（JWT、BCrypt），启用 HttpOnly Cookie；代码评审与安全测试 | Cookie 无法设置/跨域受限 |
| 搜索效果不足 | 中 | 先库内模糊匹配，后续接入搜索引擎 | 需求强依赖高质量搜索 |
| 审核策略不明确 | 中 | 默认关闭，保留开关；接口返回状态 | 运营强制要求上线即审核 |
| 时间估算偏差 | 中 | 小批量迭代，留出缓冲 | 核心人员不可用 >3天 |

### 5.2 假设
- 单体部署即可满足初期负载
- 图片走对象存储，接口仅保存 URL
- RPO≤24h，RTO≤4h 可满足课程作业场景

 ## 6. 交付与验收
 - DoR：需求清楚、接口/DDL 定稿、验收标准明确
 - DoD：代码合并、测试通过、文档更新、演示通过
 
## 7. 后端开发步骤与提示词目录

> 后端统一采用 Spring Boot 3.x + Java 17 单体架构。
> 各步骤的详细 AI 提示词已拆分为单独 Markdown 文件，存放在 `backend/prompts/` 目录下。
> 使用方式：根据当前要做的步骤 S0–S10，打开对应文件，将其中提示词内容复制给 AI 助手即可。

### S0. 项目初始化与分层架构确定

- **对应 Backlog**：跨 B1–B10 的准备工作
- **目标**：选定 Spring Boot 技术栈，创建基础项目结构与分层架构骨架（接口层 / 领域服务层 / Repository 层），约定配置与依赖管理方式。
- **提示词文件**：`backend/prompts/S0-project-init-springboot.md`

### S1. 数据库初始化与迁移脚本（PostgreSQL）

- **对应 Backlog**：B1 数据库初始化
- **目标**：基于给定 DDL 和概念模型，完成 PostgreSQL 初始化、迁移脚本/工具链、连接配置与基本健康检查。
- **提示词文件**：`backend/prompts/S1-db-init-springboot.md`

### S2. 认证模块与用户模型（注册/登录/JWT Cookie）

- **对应 Backlog**：B2 认证模块
- **目标**：使用 Spring Security + JWT HttpOnly Cookie 实现注册/登录/退出接口、用户模型与鉴权中间件。
- **提示词文件**：`backend/prompts/S2-auth-springboot.md`

### S3. 商品发布与详情 API

- **对应 Backlog**：B3 商品发布/详情 API
- **目标**：实现商品发布与详情查询，支持状态机与后续报价/留言聚合。
- **提示词文件**：`backend/prompts/S3-item-detail-springboot.md`

### S4. 商品搜索 API（分页与筛选）

- **对应 Backlog**：B4 搜索商品 API
- **目标**：实现基于关键字、分类、价格区间等条件的商品搜索接口，支持分页与排序，并结合索引优化查询。
- **提示词文件**：`backend/prompts/S4-item-search-springboot.md`

### S5. 需求 Demands API（发布/详情/搜索）

- **对应 Backlog**：B5 需求发布/详情/搜索 API
- **目标**：实现与商品对称的需求发布/详情/搜索接口，复用通用逻辑，保持数据模型与状态机一致。
- **提示词文件**：`backend/prompts/S5-demand-api-springboot.md`

### S6. 报价 Offers API

- **对应 Backlog**：B6 报价 API
- **目标**：实现发起报价接口，校验自报价、目标存在与状态，定义报价状态枚举并写入数据库。
- **提示词文件**：`backend/prompts/S6-offer-api-springboot.md`

### S7. 留言 Comments API

- **对应 Backlog**：B7 留言 API
- **目标**：实现新增留言与列表接口，基于 targetType/targetId 关联 Item/Demand，并支持分页。
- **提示词文件**：`backend/prompts/S7-comment-api-springboot.md`

### S8. 信息管理（更新/下架/软删）

- **对应 Backlog**：B8 信息管理
- **目标**：实现对商品与需求的更新、下架与软删操作，统一所有权校验与状态转移规则。
- **提示词文件**：`backend/prompts/S8-management-springboot.md`

### S9. 审计日志与错误码统一

- **对应 Backlog**：B9 审计日志与错误码统一
- **目标**：为关键操作写入审计日志，统一错误返回格式 `{code,message}`，并在全局错误处理中映射 HTTP 状态码与业务错误码。
- **提示词文件**：`backend/prompts/S9-audit-error-springboot.md`

### S10. 非功能基线（限流/日志/监控与测试）

- **对应 Backlog**：B10 非功能基线
- **目标**：为生产环境准备基础的限流、结构化日志、监控埋点，以及与关键接口相关的测试用例脚手架。
- **提示词文件**：`backend/prompts/S10-nfr-springboot.md`

