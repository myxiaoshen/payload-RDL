# Payload-RDL 🚀

> **R**esource **D**ownload & **L**earning — 一个基于 Payload CMS 构建的资源下载与学习demo。

集成了 **内容发布、软件/资源下载、交易市场、会员体系、金币与签到、评论互动、消息通知** 等模块，用一套 Headless CMS 同时驱动后台管理与前台站点。

---

## 📖 项目简介

Payload-RDL 是一个面向「资源下载 + demo」场景的全栈应用。它以 Payload CMS 作为内容与数据中枢，前台使用 Next.js App Router 渲染，具备完整的用户体系与虚拟经济闭环：

- 📚 **内容中心**：文章（Posts）、专栏系列（Series）、页面（Pages），支持富文本、分类、SEO。
- 💾 **软件下载**：软件库（Software）+ 分类，带受控下载端点。
- 🛒 **资源交易市场**：用户可上架资源（MarketResources），经审核后上架售卖。
- 👑 **会员 & 金币体系**：会员购买、每日签到、金币交易流水、订单管理。
- 💬 **社区互动**：评论、收藏、站内消息、通知与已读状态。
- 🔎 **全站搜索**：基于 Payload Search 插件构建的搜索索引。
- 🌏 **中文优先**：后台与前台默认中文 i18n。

---

## 🧰 技术栈与版本

| 分类 | 技术 | 版本 |
|---|---|---|
| CMS / 后端 | [Payload CMS](https://payloadcms.com) | `3.86.0` |
| 前端框架 | [Next.js](https://nextjs.org) (App Router) | `16.2.6` |
| UI 运行时 | React / React DOM | `19.2.6` |
| 语言 | TypeScript | `5.7.3` |
| 数据库适配器 | `@payloadcms/db-postgres` / `@payloadcms/db-mongodb` | `3.86.0` |
| 富文本编辑器 | `@payloadcms/richtext-lexical` | `3.86.0` |
| 样式 | Tailwind CSS + `tw-animate-css` + Typography | `4.1.18` |
| UI 组件 | Radix UI + `class-variance-authority` + `lucide-react` | — |
| 图片处理 | sharp | `0.34.2` |
| 表单 | react-hook-form | `7.71.1` |
| 测试 | Vitest `4.0.18` + Playwright `1.58.2` | — |
| 包管理 | pnpm | `^9 / ^10 / ^11` |
| 运行环境 | Node.js | `^18.20.2 \|\| >=20.9.0` |

---

## ⭐ 为什么选择 Payload（相比基础 CMS 的优势）

Payload 是 **代码优先（config-as-code）** 的 Headless CMS，相比传统「界面配置型」CMS，它更像一个"内置了后台的后端框架"：

| 能力 | 传统基础 CMS | Payload-RDL 使用的 Payload |
|---|---|---|
| **API** | 通常仅 REST，扩展受限 | 每个集合自动生成 **REST + GraphQL** 双端点，类型自动同步 |
| **类型安全** | 弱 / 无 | 由集合配置自动生成 `payload-types.ts`，前后端共享 TypeScript 类型 |
| **访问控制** | 角色粗粒度 | **字段级 / 文档级** 细粒度 Access，可写查询级过滤（如作者只能改自己 pending 的资源）|
| **自定义业务** | 需插件或外部服务 | 直接编写 **Custom Endpoints + Hooks**，业务逻辑与 CMS 同仓 |
| **数据库** | 绑定单一数据库 | 适配器可插拔，本项目按连接串协议 **自动在 Postgres / MongoDB 间切换** |
| **实时预览** | 需额外方案 | 原生 **Live Preview**，内置手机 / 平板 / 桌面断点 |
| **后台定制** | 有限主题 | React 组件级注入（`beforeLogin` / `beforeDashboard` 等）|

> 💡 一句话：Payload 让「内容管理」和「业务后端」共用一套配置、一套类型、一套鉴权，避免了 CMS 与业务服务之间的胶水层。

---

## 🛠️ 在原模板上改造了哪些地方

本项目基于 Payload 官方 **Website Template** 起步，做了大量业务化扩展：

### 新增集合（Collections）
在官方模板的 `Pages / Posts / Media / Categories / Users` 基础上，新增：

- `Software` + `SoftwareCategories` —— 软件下载库与分类
- `MarketResources` + `MarketCategories` —— 资源交易市场
- `Orders` / `CoinTransactions` —— 订单与金币流水
- `Series` —— 专栏 / 系列教程
- `Comments` / `Favorites` —— 评论与收藏
- `Messages` / `Notifications` / `NotificationReads` —— 站内信与通知已读

### 新增自定义端点（Endpoints）
- `download` —— 受控文件下载
- `market/checkin` —— 每日签到发放金币
- `market/purchase` —— 资源购买（扣费 + 订单 + 流水）
- `market/buyMembership` —— 会员购买
- `market/resourceDownload` —— 会员 / 已购资源下载鉴权

### 其它改造
- 🌏 **默认中文 i18n**：接入 `@payloadcms/translations` 的 `zh`，后台标签全面中文化。
- 🔀 **双数据库适配器**：`payload.config.ts` 根据 `DATABASE_URL` 协议自动选择 Postgres / MongoDB，便于迁移。
- 📊 **后台仪表盘增强**：注入自定义 `MarketStats` 组件展示市场统计。
- 🔐 **精细化访问控制**：如 `MarketResources` 中作者仅能修改自己 `pending` 状态的资源。
- 📝 **Markdown 粘贴字段**：`fields/markdownPaste` 支持粘贴即转富文本。
- 🗂️ **迁移数据**：`migration-data/` 提供各集合与全局的 JSON 种子数据。

---

## 📚 参考的官方技术

本项目直接采用并集成了以下 Payload 官方能力与插件：

| 官方技术 | 用途 |
|---|---|
| **Payload Website Template** | 项目脚手架基础 |
| `@payloadcms/plugin-seo` | 自动生成标题 / URL / SEO 元信息 |
| `@payloadcms/plugin-search` | 为 `posts` / `software` 构建全站搜索索引 |
| `@payloadcms/plugin-nested-docs` | 分类的嵌套层级与 URL 生成 |
| `@payloadcms/richtext-lexical` | Lexical 富文本编辑器 |
| `@payloadcms/live-preview-react` | 前台实时预览 |
| `@payloadcms/admin-bar` | 前台管理工具条 |
| `@payloadcms/ui` | 复用官方后台 UI 组件 |
| Payload **Jobs / Cron** | 结合 Vercel Cron Secret 的定时任务鉴权 |

---

## 🚀 部署方式

### 1️⃣ 环境要求

- Node.js `>=18.20.2`（推荐 20+）
- pnpm `>=9`
- 一个数据库：**PostgreSQL** 或 **MongoDB**

### 2️⃣ 克隆与安装

```bash
git clone <your-repo-url> payload-RDL
cd payload-RDL
pnpm install
```

### 3️⃣ 配置环境变量

在项目根目录创建 `.env`：

```bash
# 数据库连接串：mongodb:// 开头自动走 MongoDB，否则走 Postgres
DATABASE_URL=postgres://user:password@localhost:5432/payload_rdl

# Payload 密钥（务必替换为随机字符串）
PAYLOAD_SECRET=your-long-random-secret

# 站点地址（用于 SEO / 预览 / CORS）
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# 定时任务密钥（可选，配合 Vercel Cron 使用）
CRON_SECRET=your-cron-secret
```

### 4️⃣ 生成类型 & 导入种子数据

```bash
pnpm generate:types      # 生成 payload-types.ts
pnpm reset:seed          # 重置并导入 migration-data 种子数据（会清库，谨慎使用）
```

### 5️⃣ 本地开发

```bash
pnpm dev
```

访问：

- 前台：<http://localhost:3000>
- 后台：<http://localhost:3000/admin>

### 6️⃣ 生产构建

```bash
pnpm build      # 构建 Next.js + 生成 sitemap
pnpm start      # 启动生产服务
```

### 7️⃣ 平台部署建议

- **Vercel**：原生支持 Next.js；数据库使用托管 Postgres（如 Neon / Supabase）或 MongoDB Atlas；在环境变量中配置 `CRON_SECRET` 以启用定时任务。
- **自托管 / Docker**：任意支持 Node 20 的服务器，`pnpm build && pnpm start`，前置 Nginx 反代即可。

---

## 🤖 依赖的 MCP 与辅助工具

本项目在开发流程中集成了 **Memorix**（跨会话项目记忆）作为 MCP 服务，并配套一批开发辅助工具。

### MCP 服务

| MCP | 说明 | 配置位置 |
|---|---|---|
| **Memorix** | 跨会话持久化项目记忆，提供架构决策、问题解法、约定等上下文注入 | [.vscode/mcp.json](.vscode/mcp.json)、[memorix.toml](memorix.toml) |

Memorix 通过 `memorix serve` 以 stdio 传输启动，内置 Dashboard（默认端口 `3210`）。记忆治理规约见 [.github/copilot-instructions.md](.github/copilot-instructions.md)。

```bash
pnpm memory:check      # 只读体检：容量 / 重复 / 低质量 / 健康度
pnpm memory:maintain   # 执行治理：合并重复 + 清理低质量 + 归档过期
```

### 开发辅助工具

| 工具 | 用途 |
|---|---|
| **ESLint** + **Prettier** | 代码规范与格式化（`pnpm lint` / `pnpm lint:fix`）|
| **Vitest** | 集成 / 单元测试（`pnpm test:int`）|
| **Playwright** | 端到端测试（`pnpm test:e2e`）|
| **tsx** | 直接运行 TypeScript 脚本（种子、迁移等）|
| **cross-env** | 跨平台环境变量注入 |
| **next-sitemap** | 构建后自动生成站点地图 |

---

## 📜 常用脚本速查

| 脚本 | 作用 |
|---|---|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 + 生成 sitemap |
| `pnpm start` | 启动生产服务 |
| `pnpm generate:types` | 生成 Payload TS 类型 |
| `pnpm generate:importmap` | 生成后台组件 import map |
| `pnpm reset:seed` | 重置并导入种子数据 |
| `pnpm lint` / `pnpm lint:fix` | 代码检查 / 自动修复 |
| `pnpm test` | 运行全部测试 |
| `pnpm memory:check` / `pnpm memory:maintain` | Memorix 记忆体检 / 治理 |

---

## 📄 License

[MIT](LICENSE)
