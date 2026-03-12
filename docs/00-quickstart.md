# 00 - 5 分钟上手（Frontend）

目标：让第一次打开仓库的人，在 5–10 分钟内成功跑起前端，并知道“接口契约”去哪里查。

AI 执行 TL;DR：

- 先 `npm install`，再 `npm run dev`
- 失败就立刻把“第一段报错堆栈 + Node 版本 + npm 版本”记录下来再排查

## 你需要什么

- Node.js（建议 20+ 或 22+）
- npm

## 1) 安装与启动

在仓库根目录：

```bash
cd frontend
npm install
npm run dev
```

默认启动 Vite 开发服务器（通常是 `http://localhost:5173`）。

预期结果（用于验收）：

- 终端输出包含类似 `VITE v... ready in ...ms`
- 浏览器能打开页面，且进入系统后 Header/侧边栏正常渲染

## 2) 构建验证（CI/发布前）

```bash
cd frontend
npm run build
```

预期结果（用于验收）：

- `tsc -b` 与 `vite build` 都成功
- 允许出现 chunk 过大 warning，但不允许报错退出

## 3) 接口文档在哪里

前端对齐后端 contract 时，优先以这些为准：

- API 索引：[../../backend/docs/api/README.md](../../backend/docs/api/README.md)
- 接口清单：[../../backend/docs/api/api-endpoint-list.md](../../backend/docs/api/api-endpoint-list.md)
- 通用错误响应：[../../backend/docs/api/common-error-response-example.md](../../backend/docs/api/common-error-response-example.md)

## 4) 推荐阅读顺序（接手者）

1. [01-frontend-overview.md](01-frontend-overview.md)
2. [02-architecture.md](02-architecture.md)
3. [04-preferences.md](04-preferences.md)
4. AI 直接执行用：[06-ai-runbook.md](06-ai-runbook.md)
5. 再按需要看 [../README.md](../README.md)

## 5) 快速采集信息（dev 失败时）

当 `npm run dev` 退出（Exit Code 1）时，优先收集这些信息再开始“猜原因”：

```bash
cd frontend
node -v
npm -v

# 重新跑一次，保留第一段报错（最关键）
npm run dev
```

记录要点：

- 第一条错误（first error）通常最有用
- 若是端口占用/权限问题，错误信息会非常直接
