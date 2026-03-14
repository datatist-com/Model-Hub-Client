# Datatist Model Hub Client

Model Hub 前端应用，基于 React 19 + Vite 7 + TypeScript + Ant Design 构建。
通过 GitHub Actions 自动编译为跨平台单文件可执行程序，内嵌静态资源，无需额外部署。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript 5.9 |
| 构建 | Vite 7 |
| UI | Ant Design 5 |
| 路由 | React Router 7 |
| 国际化 | i18next（中文/英文） |
| 图表 | Recharts |
| 服务端 | Go 1.22（embed 静态资源） |
| CI/CD | GitHub Actions → 自动 Tag + Release |

## 功能模块

- **仪表盘** — 系统概览
- **数据源管理** — Hive / DuckDB 数据源接入
- **特征源表管理** — 源表字段配置与特征衍生
- **用户画像管理** — 画像期数管理
- **目标管理** — 目标变量定义与期数管理
- **模型管理** — 模型训练、详情、Lift 图表
- **评分生成** — 模型评分任务与结果列表
- **运营人群包** — 人群包创建、产出、A/B Test
- **用户管理** — 6 种角色的 RBAC 权限控制
- **日志查看** — 系统操作日志

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查 + 构建
npm run build
```

## 编译为可执行文件（本地）

```bash
# 1. 构建前端
npm run build

# 2. 编译 Go 二进制
rm -rf server/dist && cp -r dist server/dist
cd server && go build -ldflags="-s -w" -trimpath -o ../model-hub-client .
```

## 使用方式

```bash
# 启动（默认后台运行，0.0.0.0:8000）
./model-hub-client

# 指定地址和端口
./model-hub-client --host 127.0.0.1 --port 9000

# 前台运行
./model-hub-client -f

# 停止
./model-hub-client stop

# 重启
./model-hub-client restart --port 8080

# 查看帮助
./model-hub-client --help
```

默认后台运行，日志输出到 `<binary>.log` 文件。加 `-f` 参数可前台运行。

## 发布流程

推送到 `main` 分支后，GitHub Actions 自动执行：

1. 自动递增 patch 版本号并创建 Git Tag
2. 构建前端 + 交叉编译 6 个平台的 Go 二进制
3. 发布 GitHub Release 并上传编译产物

支持平台：`linux-amd64` / `linux-arm64` / `darwin-amd64` / `darwin-arm64` / `windows-amd64` / `windows-arm64`

## 项目结构

```
├── src/
│   ├── auth/           # 认证 & RBAC 角色权限
│   ├── components/     # 公共组件
│   ├── i18n/           # 国际化配置
│   ├── layouts/        # 布局（侧边栏菜单）
│   ├── locales/        # 中英文语言包
│   ├── pages/          # 页面组件
│   ├── platform/       # 平台环境检测
│   ├── router/         # 路由配置
│   └── theme/          # 主题配置（暗色/亮色）
├── server/
│   ├── main.go         # Go 服务端（embed + 进程管理）
│   └── go.mod
├── .github/workflows/
│   └── release.yml     # CI/CD 自动发布
└── index.html          # 入口 HTML
```

## 角色权限

系统内置 6 种角色，通过菜单可见性实现权限控制。系统管理员仅有一个，不可新增。

| 功能模块 | 系统管理员 | 建模工程师 | 数据工程师 | 业务运营 | 项目管理员 | 项目成员 |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 仪表盘 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 数据源管理 | ✓ | ✓ | ✓ | | ✓ | |
| 特征源表管理 | ✓ | ✓ | | | | |
| 用户画像管理 | ✓ | ✓ | ✓ | | ✓ | |
| 目标管理 | ✓ | ✓ | ✓ | | ✓ | |
| 模型管理 | ✓ | ✓ | | | | |
| 评分生成 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 运营人群包 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 用户管理 | ✓ | | | | ✓ | |
| 日志查看 | ✓ | | | | | |

**用户管理权限：**
- 系统管理员：可管理所有角色的用户
- 项目管理员：仅可管理项目成员

## License

Private
