# Frontend 文档索引（交接 / 上手 / AI 执行）

这份 `frontend/docs/` 既给人看，也给后续 AI agent 直接执行用（同版本：GPT-5.2）。目标是：**不用猜、按步骤做就能接手并交付改动**。

阅读/执行顺序建议：先跑起来 → 理解架构与偏好 → 再做功能改动。

## 快速入口

- 5 分钟上手：[00-quickstart.md](00-quickstart.md)
- 前端概览（范围/模块）：[01-frontend-overview.md](01-frontend-overview.md)
- 架构与关键设计（会话标签 keep-alive 等）：[02-architecture.md](02-architecture.md)
- 本地开发与调试：[03-development.md](03-development.md)
- 作者偏好与约定（你继续开发请遵循）：[04-preferences.md](04-preferences.md)
- 常见问题排查：[05-troubleshooting.md](05-troubleshooting.md)
- AI 执行手册（任务模板 + 验收清单）：[06-ai-runbook.md](06-ai-runbook.md)

## AI 使用约定（非常重要）

- 你是“代码执行者”，不是“重写者”：除非需求明确，不要大重构/大搬家。
- 每次改动都要有可验证的结果：至少 `npm run build` 通过；能跑 dev 更好。
- 不确定就先搜索（grep/语义搜索）再动手；避免凭记忆猜文件位置。
- 任何涉及会话标签/keep-alive/主题/i18n 的改动，必须回看 [04-preferences.md](04-preferences.md) 的 MUST 规则。

## 相关链接

- 前端 README（偏页面/交互规范）：[../README.md](../README.md)
- 后端 API 文档索引（对齐接口时用）：[../../backend/docs/api/README.md](../../backend/docs/api/README.md)
