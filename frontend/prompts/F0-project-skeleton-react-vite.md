# F0 前端项目骨架（React + TypeScript + Vite）

你现在作为资深前端架构师和代码生成助手，帮助我为「二手交易平台」搭建基于 **React + TypeScript + Vite** 的前端项目骨架（对应 Backlog F0）。

上下文文档：
- frontend/前端开发计划.md
- frontend/plan-backlog-frontend.md
- frontend/前端开发建议顺序.md
- backend/api-spec.md

统一技术栈约定（可根据需要微调）：
- 构建：Vite + React + TypeScript
- 路由：React Router v6
- 状态：Zustand 或 Redux Toolkit（二选一，请给推荐并说明理由）
- 请求：Axios（或 Fetch 封装）
- 表单校验：React Hook Form + Zod（或 Yup）
- UI：TailwindCSS + 组件库（如 shadcn/ui 或 Ant Design，二选一请给建议）
- 代码质量：ESLint + Prettier + Husky + lint-staged

请完成：
1. 根据前端开发计划中的“技术栈与约定”和“目录建议”，设计前端项目整体结构：
   - 目录结构（如 src/pages, src/components, src/features, src/services, src/stores, src/hooks, src/utils, src/assets 等）。
   - 包含路由与布局（基础 Layout + 子页面占位）。
2. 给出 Vite + React + TS 项目的初始化方案：
   - 推荐的 `npm`/`pnpm`/`yarn` 初始化命令。
   - `package.json` 的关键依赖与脚本示例（dev/build/test/lint）。
3. 设计路由骨架，与文档中的路由表保持一致（/login, /register, /items, /items/:id, /publish/item, /demands, /demands/:id, /publish/demand, /me/posts, /admin/review 等）：
   - 使用 React Router v6，给出路由配置示例（可以使用 `createBrowserRouter` 或传统 `<Routes>` 方式）。
   - 为受保护路由（需要登录/管理员）预留守卫组件/逻辑位置。
4. 设计基础 Layout 与全局 UI 容器：
   - 如：`AppShell` 包含 NavBar/Footer、主内容区、全局 Toast/Modal Provider 等。
   - 预留加载 Skeleton 与错误边界位置。
5. 集成代码质量与规范工具：
   - ESLint + Prettier + TypeScript 配置建议。
   - Husky + lint-staged 的基本配置示例。

输出格式建议：
1. 先用文字说明技术栈选择与目录设计的理由（结合前端开发计划中的建议）。
2. 然后给出目录结构树和关键文件清单。
3. 最后给出 `main.tsx` / `App.tsx`、路由配置、Layout 容器以及 `package.json` 片段示例（可以省略实现细节，但结构要清晰）。
