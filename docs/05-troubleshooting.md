# 05 - 常见问题排查（Frontend）

这篇文档按“AI 可诊断”的方式写：先采集证据（first error），再分流排查；避免盲猜。

## `npm run dev` 直接退出 / Exit Code 1

### 0) 先采集信息（必须做）

把下面三段输出复制保存（first error 最关键）：

```bash
cd frontend
node -v
npm -v
npm run dev
```

如果报错很长：只保留第一段报错（第一条 stack trace）+ 紧随其后的 20 行。

### 1) 依赖安装

1) 确认依赖安装成功

```bash
cd frontend
npm install
```

如 `npm install` 也失败：优先修 npm/Node 版本与网络/代理，再继续。

2) 检查 Node 版本（建议 20+ 或 22+）

```bash
node -v
npm -v
```

经验规则：Node 版本偏旧/偏新都可能导致 Vite/依赖行为异常；优先切到建议版本。

3) 清理重装（依赖树异常时常见）

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

4) 端口冲突

Vite 默认通常是 5173，查看占用：

```bash
lsof -i :5173
```

如端口被占用：

- 结束占用进程，或
- 让 Vite 换端口（看终端输出），并用输出的 URL 打开

5) 如果 `npm run build` 正常但 dev 不正常

重点排查：

- Vite 配置：`vite.config.ts`
- 本地 Node 版本与依赖兼容性
- 是否有残留环境变量影响（代理、HTTPS 等）

额外检查（常见但容易漏）：

- 当前工作目录是否正确（必须在 `frontend/`）
- 是否存在本地自定义环境变量（例如 `VITE_*`）导致 dev-only 行为

## 构建提示 chunk 太大

Vite 报 chunk > 500kB 通常不影响功能；需要再做性能优化时再处理（路由懒加载已启用）。
