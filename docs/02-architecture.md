# 02 - 架构与关键设计（Frontend）

AI 执行 TL;DR：本项目的“核心差异化体验”在 Header 会话标签 + keep-alive。任何改动都要把它当作不可破坏的 contract。

## 技术栈

- React + TypeScript
- Vite
- Ant Design
- React Router
- i18n：i18next + react-i18next

## 关键设计：Header 会话标签（Session Tabs）+ Keep-Alive

目标：让用户“像浏览器标签页一样”在多个业务页之间切换，并且回到某个页时，原先的筛选、滚动、表单输入等状态仍保留。

实现要点：

- Header 会话标签：展示已打开的“会话”（可切换/可关闭）
- Keep-Alive：切换会话时页面组件不卸载
- 关闭会话时驱逐缓存，释放内存
- 支持 replace-tab 导航：页面内 drill-down / 返回操作“替换当前标签”，不新增标签

### 行为契约（Contract）

MUST：

- 标签切换不卸载页面组件（状态保留）
- 关闭标签会同步更新持久化，并驱逐 keep-alive 缓存
- 关闭当前激活标签会立即跳转到“上一个可用标签”
- 页面内 drill-down/返回默认为 replace-tab（避免标签爆炸）

SHOULD：

- 会话标题必须可区分但不过度堆叠：`页面名 (当前层名称)`
- 刷新页面后，会话标题仍能正确 i18n（不要出现 raw 文本/旧语言）

代码入口（要改这块从这里下手）：

- Header & 会话标签管理：`src/layouts/AppLayout.tsx`
- Keep-Alive Outlet：`src/router/KeepAliveOutlet.tsx`
- localStorage 持久化：`src/auth/token.ts`

标题规则：

- 会话标题采用 `页面名 (当前层名称)`
- “当前层名称”来自路由 query 参数或友好映射（例如 dataSourceId → hive-prod）

### 当你需要“并行处理多个对象”

允许同一路由存在多个会话时：

- 把对象标识放进 query（例如 `?userId=...` / `?databaseName=...`）
- 会话 identity key 需要包含该 query
- 标题括号里只放“当前层名称”（最具体的那一层）

不要做：

- 仅靠 pathname 区分会话（会导致互相覆盖/状态串）

## 主题与偏好

- 主题偏好：dark/light/system（localStorage、按用户隔离）
- 语言偏好：i18n language（localStorage、按用户隔离）

样式入口：

- `src/styles.css`

### 主题改动回归清单

- dark/light 都检查一次：标题、表格、分页、弹窗
- hover/active 不要出现淡青/荧光抢眼色（优先中性灰）
- 表格表头在主题切换时有过渡（不闪变）
