# 01 - 前端概览

这篇文档回答两个问题：

1) 这个前端“现在做到了哪里”
2) 你要改一个需求时，应该从哪个入口文件开始找

## 前端是什么

这是一个管理台前端（React + TypeScript + Vite + Ant Design），用于覆盖：

- 01 通用模块（登录、用户、许可证…）
- 02 数据库管理（数据源、Hive/DuckDB 浏览与任务…）

当前阶段以“对齐后端 API 文档的 Mock 页面 + 交互规范”为主，不保证已接通真实后端。

AI 执行提示：默认把自己当作“继续完善前端交互/架构”的实现者，而不是接口对接者；除非需求明确要求对接真实后端。

## 目录结构（关键）

- `src/layouts/`：应用壳（Header、会话标签等）
- `src/router/`：路由与 keep-alive 实现
- `src/pages/`：页面
- `src/locales/`：i18n 资源
- `src/styles.css`：全局样式（含主题切换与 light override）

推荐用“找入口”而不是“背目录”：

- 要改 Header/会话标签/右上角菜单 → `src/layouts/AppLayout.tsx`
- 要改 keep-alive/缓存/驱逐 → `src/router/KeepAliveOutlet.tsx`
- 要改 localStorage（token/偏好/会话持久化）→ `src/auth/token.ts`
- 要改主题/颜色/表格过渡 → `src/styles.css`
- 要改 i18n key → `src/locales/zh-CN.ts` + `src/locales/en-US.ts`

## 你改代码前要知道的约定

- i18n 文案不要硬编码：优先在 `src/locales/*` 加 key
- 主题支持 dark/light/system，且 light 模式强调“可读性优先”
- Header 会话标签是核心体验：页面切换要保留状态、可关闭并释放缓存

验收底线（每次提交都要满足）：

- `npm run build` 通过
- 不破坏会话标签的 3 个核心能力：keep-alive / 可关闭驱逐 / replace-tab

## 对齐接口的入口

- 后端 API 索引：[../../backend/docs/api/README.md](../../backend/docs/api/README.md)
- 通用错误响应：[../../backend/docs/api/common-error-response-example.md](../../backend/docs/api/common-error-response-example.md)
