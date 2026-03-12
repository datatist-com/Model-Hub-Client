# 03 - 本地开发与调试（Frontend）

这篇文档给 AI/开发者一个“照着做就不会偏”的工作流与模板。

## 运行

```bash
cd frontend
npm install
npm run dev
```

预期结果：终端显示 Vite ready 信息；浏览器能正常打开页面。

常用脚本：

- `npm run dev`：开发服务器
- `npm run build`：生产构建（TypeScript + Vite）
- `npm run preview`：本地预览生产构建

## 推荐环境

- Node.js：建议 20+ 或 22+

AI 执行建议：当 dev 出现 Exit Code 1，优先升级/切换 Node 到建议版本再继续排查（见 [05-troubleshooting.md](05-troubleshooting.md)）。

## 建议的开发流程

1. 先明确要对齐的后端 contract（请求/响应/错误码）
2. 页面优先按模块落地（必要时先 Mock）
3. 接口对接时统一封装请求层（鉴权、错误归一化、traceId 透传）

每次改动的最小验收：

- `npm run build` 通过
- 主题：light/dark 都看一次
- 会话标签：至少做一次“切换保持状态”和“关闭驱逐缓存”回归

相关后端文档入口：

- API 索引：[../../backend/docs/api/README.md](../../backend/docs/api/README.md)
- 错误响应示例：[../../backend/docs/api/common-error-response-example.md](../../backend/docs/api/common-error-response-example.md)

## 常见任务模板

### A) 新增页面

1. 在 `src/pages/` 新增页面组件
2. 加入路由配置（确保在 keep-alive 路由结构中工作）
3. 增加 i18n key（中/英）
4. 如页面内有 drill-down/返回，默认使用 replace-tab
5. 自测与构建

### B) 新增/修改 i18n 文案

- 在 `src/locales/zh-CN.ts` 与 `src/locales/en-US.ts` 同步新增 key
- UI 中使用 `t('your.key')`，不要硬编码

### C) 修改主题/全局样式

- 样式集中在 `src/styles.css`
- 任何颜色/对比度改动，必须在 light 模式下检查表格/标题/分页

### D) 改会话标签/keep-alive

先读：

- [02-architecture.md](02-architecture.md)
- [04-preferences.md](04-preferences.md)
- [06-ai-runbook.md](06-ai-runbook.md)

不要做：

- 大重构（除非需求明确）
- 改标题规则成多层堆叠
