# 06 - AI 执行手册（Frontend）

受众：后续 AI agent（同版本：GPT-5.2）在本仓库继续迭代前端。

目标：把“如何在这个项目里做改动”写成可执行 SOP，减少来回问答与误改。

## 0) 先验信息（不要假设）

AI 在开始写代码前，必须先确认/收集：

- 需求范围：只改前端？是否允许改 API 文档/后端？（默认：只改前端）
- 需要支持的语言：中文/英文是否都要补齐？（默认：都要）
- 主题：改动是否要同时兼容 light/dark？（默认：必须兼容）
- 是否允许新增依赖：能不用就不用；如要加，先说清原因与替代方案

## 1) 最小安全工作流（每次改动都按这个来）

1. 搜索定位入口文件（不要猜）
2. 改动尽量小且集中（同一语义在同一处收敛）
3. 自测：
   - 必须：`npm run build`
   - 推荐：`npm run dev` + 人工点几下关键路径
4. 记录：改了哪些文件、为什么、有哪些约束/回归点

## 2) 项目里“最容易误改”的 4 个点

### 2.1 Header 会话标签（Session Tabs）

MUST：

- 切换标签不丢状态（keep-alive）
- 关闭标签必须驱逐缓存释放内存
- drill-down/返回默认 replace-tab（替换当前标签，不新增）
- 标签标题保持克制：`页面名 (当前层名称)`

代码入口：

- `src/layouts/AppLayout.tsx`
- `src/router/KeepAliveOutlet.tsx`
- `src/auth/token.ts`

回归检查（最少做两条）：

- 打开两个会话 → 来回切换 → 输入/筛选状态仍在
- 关闭当前会话 → 立刻跳回上一个会话且不会“刷新复活”

### 2.2 主题（dark/light/system）

MUST：

- light 模式可读性优先：标题/表格/分页必须有足够对比度
- 避免淡青/荧光 hover；尽量中性灰
- 表格主题切换要有过渡（不闪变）

入口：`src/styles.css`

### 2.3 i18n

MUST：

- UI 文案不硬编码：新增文案必须加 i18n key
- 与会话标签标题相关：持久化用 `labelKey`，展示用 `t(labelKey)`

入口：

- `src/locales/zh-CN.ts`
- `src/locales/en-US.ts`

### 2.4 路由与页面

- 新页面通常在 `src/pages/`
- 路由配置（与 keep-alive 的关系）通常在 `src/router/` 与 layout 里

## 3) 常见任务模板（直接复制执行）

### 3.1 新增一个页面（可被会话标签缓存）

1) 新增页面组件：`src/pages/FooPage.tsx`
2) 配置路由：在路由配置处加入 path → element
3) 菜单与标题：
   - 新增 i18n key（中/英）
   - 会话标签显示的标题用该 key（不要存中文字符串）
4) 主题适配：在 light/dark 下都检查一次
5) 验收：`npm run build` 通过

### 3.2 页面内 drill-down 不要新增标签（replace-tab）

- 使用 `navigate(target, { state: { sessionTabMode: 'replace' } })`
- 如 drill-down 需要并行打开两个对象，才允许新开会话（不要默认）

验收：

- 从列表点进详情不会多一个标签
- 返回能回到同一会话、状态仍在

### 3.3 同一路由允许多个会话（依赖 query 区分）

- 如果要并行编辑多个对象：
  - 把对象标识（如 `id`、`username`、`databaseName`）放进 query
  - 会话 identity key 需要包含该 query

验收：

- 两个对象能同时在两个会话中存在
- 标题能区分（遵守 `页面名 (当前层名称)`）

## 4) 修改完成的“交付清单”（写在最终回复里）

- 变更文件列表
- 关键行为/约束（例如 keep-alive、标题规则、light 可读性）
- 验证方式：至少 `npm run build`；如 dev 失败，贴出失败原因与下一步

## 5) 当你需要向人提问时（最小问题集）

只问能决定实现的必要信息：

- 这是“替换当前会话”还是“允许多会话并行”？
- 标题括号里“当前层名称”优先用哪个字段？（source/db/table/user…）
- light 模式是否有指定对比度/颜色偏好？（默认中性灰）
