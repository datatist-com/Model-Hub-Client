# Datatist Model Hub - Frontend 文档（对齐后端 01 / 02）

本文件先聚焦前端与后端 **01 通用模块**、**02 数据库管理** 的页面与交互规范。

## 项目交接/上手（推荐先读）

- 前端交接文档索引：[docs/README.md](docs/README.md)
- 作者偏好与约定（MUST/禁止项）：[docs/04-preferences.md](docs/04-preferences.md)
- AI 执行手册（任务模板 + 验收清单）：[docs/06-ai-runbook.md](docs/06-ai-runbook.md)

## 当前落地状态（已完成）

- 技术栈：React + Ant Design + React Router
- 路由策略：页面级懒加载（`React.lazy` + `Suspense`）
- 国际化：i18n（`i18next` + `react-i18next`，内置中文/英文）
- 后端对接：**暂未接入**（全部为 Mock 页面与本地静态数据）

已落地页面（01/02）：
- `/login`
- `/users`
- `/license`
- `/data-sources`
- `/hive-databases`
- `/hive-tables`
- `/duckdb-tables`
- `/ingest-jobs`

## 本地运行

```bash
npm install
npm run dev
```

构建验证：

```bash
npm run build
```

---

## 1. 角色身份说明

1. 系统管理员（System Admin）：系统配置、用户管理、许可证管理。
2. 模型工程师（Model Engineer）：数据源与数据准备、特征与模型流程。
3. 业务运营（Business Operator）：名单执行相关操作。
4. 普通成员（Member）：受限查看与有限操作。

---

## 2. 后端文档入口（本阶段）

- 通用模块（01）：[../backend/docs/api/01-general/README.md](../backend/docs/api/01-general/README.md)
- 数据库管理（02）：[../backend/docs/api/02-database-management/README.md](../backend/docs/api/02-database-management/README.md)
- 全量接口清单：[../backend/docs/api/api-endpoint-list.md](../backend/docs/api/api-endpoint-list.md)
- 通用错误响应：[../backend/docs/api/common-error-response-example.md](../backend/docs/api/common-error-response-example.md)

---

## 3. 前端模块划分（先落地 01 / 02）

### 3.1 认证与会话（对应后端 1.1）

页面与能力：
- 登录页：账号密码登录。
- 顶部用户菜单：登出。
- 启动鉴权：进入系统时调用 `GET /api/v1/auth/me` 校验 token。
- 修改密码：个人设置页。

交互要点：
- `accessToken` 建议存放在安全存储（优先 HttpOnly Cookie 方案，次选内存 + 刷新机制）。
- 首屏加载时先校验 token，再渲染路由。
- 对 `TOKEN_EXPIRED_OR_REVOKED` 做统一拦截并跳转登录。

### 3.2 用户管理（对应后端 1.2）

页面与能力：
- 用户列表（分页、关键字、角色筛选）。
- 新建用户。
- 编辑用户（用户名/显示名/邮箱/角色等）。
- 冻结/解冻用户。
- 删除用户（二次确认）。

交互要点：
- 角色与状态使用标签显示（`active` / `frozen`）。
- 危险操作（冻结、删除）使用确认弹窗。
- 表格操作后局部刷新当前页。

### 3.3 许可证管理（对应后端 1.3）

页面与能力：
- 激活许可证：提交 `licenseKey`。
- 查看许可证：展示脱敏激活码、激活时间、到期时间、被授权人。

接口约束（已对齐）：
- 激活：`POST /api/v1/license`，请求体仅 `licenseKey`。
- 查询：`GET /api/v1/license`。

错误处理：
- 激活页特有错误：`LICENSE_KEY_INVALID`。
- 通用错误：`UNAUTHORIZED` / `FORBIDDEN` 等按全局策略处理。

### 3.4 数据源管理（对应后端 2.1）

页面与能力：
- 数据源列表/详情。
- 创建数据源（`hive` 或 `duckdb`）。
- 更新数据源、删除数据源。
- 测试数据源连通性/权限。

表单建议：
- `type` 与 `connectionMode` 联动（hive=external，duckdb=local）。
- `config` 使用分类型动态表单。
- 对敏感字段做前端脱敏展示。

### 3.5 Hive 库/表管理（对应后端 2.2 / 2.3）

页面与能力：
- Hive 库：注册、列表、详情、更新、删除。
- Hive 表：注册、列表、详情、更新、删除。

交互要点：
- 左侧层级导航建议为：数据源 → 库 → 表。
- 删除库时提示“是否存在表引用”的业务风险。

### 3.6 DuckDB 表与入表任务（对应后端 2.4 / 2.5）

页面与能力：
- DuckDB 表：创建、列表、详情、更新、删除。
- 上传会话：创建、完成上传。
- 导入任务：发起 CSV/Parquet 入表。
- 任务查询：轮询 `GET /api/v1/jobs/{jobId}` 展示状态。

推荐流程：
1) 创建 DuckDB 表；
2) 创建上传会话；
3) 客户端直传对象存储；
4) 完成上传；
5) 发起入表任务；
6) 跳转任务详情页查看进度与结果。

---

## 4. 前端通用约定

### 4.1 API 调用与状态管理
- 统一封装请求层（自动附带 token、traceId 透传、错误归一化）。
- 异步任务统一状态枚举：`queued` / `running` / `succeeded` / `failed`。
- 列表页统一分页参数：`page`、`pageSize`。

### 4.2 错误处理
- 通用错误按 [../backend/docs/api/common-error-response-example.md](../backend/docs/api/common-error-response-example.md) 处理。
- 业务错误优先展示 `message_code` 映射文案。
- 关键错误（401/403）使用全局拦截器处理。

### 4.3 权限控制
- 路由级权限：`system_admin`、`model_engineer`、`business_operator`、`member`。
- 按钮级权限：无权限时隐藏或禁用并给出提示。

---

## 5. 后续计划

- 下一步补齐 03/04/05/06/07 模块的前端页面规范与原型清单。
- 增加字段级校验规则表与错误码映射表（前后端共享）。
