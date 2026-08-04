#                    Payload-RDL

<p align="center">
  <strong>R</strong>esource <strong>D</strong>ownload &amp; <strong>L</strong>earning — 基于 Payload CMS 构建的全栈资源下载与学习demo
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Payload_CMS-3.86.0-blueviolet?style=flat-square" alt="Payload CMS" />
  <img src="https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-38BDF8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

<p align="center">
  集成 <strong>内容发布 · 软件/资源下载 · 交易市场 · 会员体系 · 金币签到 · 评论互动 · 消息通知</strong><br/>
  用一套 Headless CMS 同时驱动后台管理与前台站点
</p>

---

## 目录

- [项目简介](#-项目简介)
- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [演示账号与 Walkthrough](#-演示账号与-walkthrough)
- [已知限制](#-已知限制)
- [环境变量](#-环境变量)
- [部署](#-部署)
- [开发指南](#-开发指南)
- [License](#-license)

---

## 📖 项目简介

Payload-RDL 是一个面向「资源下载 + 知识付费」场景的**全栈开源模板**，以 [Payload CMS](https://payloadcms.com) 作为内容与业务中枢，前台使用 Next.js App Router 渲染。

项目基于 Payload 官方 **Website Template** 深度扩展，在保留官方博客/页面体系的基础上，引入了完整的**虚拟经济闭环**：金币、签到、会员、付费资源购买与下载鉴权，可直接作为资源站、学习demo或内容社区的起点。

> **为什么选 Payload？**
> Payload 是 **代码优先（config-as-code）** 的 Headless CMS。集合配置自动生成 REST + GraphQL 端点与 TypeScript 类型，支持字段级访问控制和自定义 Endpoint/Hook，避免了传统 CMS 与业务服务之间的胶水层。数据库适配器可插拔——本项目根据连接串协议**自动在 PostgreSQL / MongoDB 间切换**。

---

## ✨ 功能特性

| 模块 | 说明 |
|---|---|
| 📚 **内容中心** | 文章（Posts）、专栏系列（Series）、自定义页面（Pages），支持 Lexical 富文本、分类树、SEO |
| 💾 **软件下载** | 软件库（Software）+ 分类，受控下载端点，支持权限校验 |
| 🛒 **资源交易市场** | 用户上架资源（MarketResources），审核后上架，支持金币购买 |
| 👑 **会员 & 金币** | 每日签到、金币流水（CoinTransactions）、订单管理（Orders），购买 VIP 自动升级角色 |
| 💬 **社区互动** | 评论（Comments）、收藏（Favorites）、悬赏（Bounties & BountySubmissions） |
| 📬 **消息通知** | 站内信（Messages）、通知中心（Notifications）与已读状态（NotificationReads） |
| 🔎 **全站搜索** | 基于 `@payloadcms/plugin-search` 的搜索索引，覆盖文章与软件 |
| 🌏 **中文优先** | 接入 `@payloadcms/translations` 的 `zh`，后台标签全面中文化 |
| 📊 **仪表盘增强** | 后台注入自定义 `MarketStats` 组件展示市场实时统计 |
| 🔐 **精细访问控制** | 字段级 / 文档级 Access，作者仅能修改自己 `pending` 状态的资源 |

---

## 🧰 技术栈

| 分类 | 技术 | 版本 |
|---|---|---|
| CMS / 后端 | [Payload CMS](https://payloadcms.com) | `3.86.0` |
| 前端框架 | [Next.js](https://nextjs.org) App Router | `16.2.6` |
| UI 运行时 | React / React DOM | `19.2.6` |
| 语言 | TypeScript | `5.7.3` |
| 数据库 | PostgreSQL（`@payloadcms/db-postgres`）/ MongoDB（`@payloadcms/db-mongodb`） | `3.86.0` |
| 富文本 | `@payloadcms/richtext-lexical` | `3.86.0` |
| 样式 | Tailwind CSS v4 + `tw-animate-css` + Typography | `4.1.18` |
| UI 组件 | Radix UI + `class-variance-authority` + `lucide-react` | — |
| 图片处理 | sharp | `0.34.2` |
| 表单 | react-hook-form | `7.71.1` |
| 测试 | Vitest `4.0.18` + Playwright `1.58.2` | — |
| 包管理 | pnpm | `>=9` |
| 运行环境 | Node.js | `^18.20.2 \|\| >=20.9.0` |

---

## 📁 项目结构

```
payload-RDL/
├── src/
│   ├── app/
│   │   ├── (frontend)/        # Next.js 前台路由
│   │   └── (payload)/         # Payload 后台路由
│   ├── collections/           # Payload 集合定义（数据模型 + 访问控制）
│   ├── blocks/                # 页面 Block 组件（内容构建器）
│   ├── components/            # 前台 React 组件
│   ├── endpoints/             # 自定义 API 端点
│   ├── hooks/                 # Payload Hooks
│   ├── plugins/               # Payload 插件配置
│   ├── access/                # 通用访问控制函数
│   └── payload.config.ts      # Payload 主配置
├── migration-data/            # 各集合 JSON 种子数据
├── scripts/                   # 数据库种子 / 迁移脚本
├── tests/
│   ├── e2e/                   # Playwright 端到端测试
│   └── int/                   # Vitest 集成测试
└── public/
    └── media/                 # 静态媒体文件
```

### 新增集合（相对官方模板）

在官方模板 `Pages / Posts / Media / Categories / Users` 基础上扩展：

- `Software` + `SoftwareCategories` — 软件下载库与分类
- `MarketResources` + `MarketCategories` — 资源交易市场
- `Orders` / `CoinTransactions` — 订单与金币流水
- `Series` — 专栏 / 系列教程
- `Comments` / `Favorites` — 评论与收藏
- `Bounties` / `BountySubmissions` — 悬赏任务
- `Messages` / `Notifications` / `NotificationReads` — 站内信与通知

### 自定义端点（Endpoints）

| 端点 | 说明 |
|---|---|
| `GET /api/download` | 受控文件下载，鉴权后返回资源 |
| `POST /api/market/checkin` | 每日签到，发放金币奖励 |
| `POST /api/market/purchase` | 资源购买：扣费 + 生成订单 + 记录流水；VIP 商品自动升级角色 |
| `GET /api/market/resourceDownload` | 会员 / 已购资源下载鉴权 |

---

## 🚀 快速开始

### 环境要求

- **Node.js** `>=18.20.2`（推荐 20+）
- **pnpm** `>=9`
- **数据库**：PostgreSQL 或 MongoDB（二选一）

### 安装

```bash
git clone https://github.com/your-username/payload-RDL.git
cd payload-RDL
pnpm install
```

### 初始化

```bash
# 1. 复制环境变量模板
cp .env.example .env   # 或手动创建，参考下方「环境变量」章节

# 2. 生成 TypeScript 类型
pnpm generate:types

# 3. 先创建管理员（首次启动后台或通过 Payload 创建），再导入演示种子
#    ⚠️ reset:seed 会清空业务数据，但保留 role=admin 的账号
pnpm reset:seed
```

> **建议顺序**：配置好 `DATABASE_URL` 与 `PAYLOAD_SECRET` → `pnpm dev` 至少成功启动一次并确保存在管理员 → 停掉或另开终端执行 `pnpm reset:seed` → 再按下方 Walkthrough 验收。

### 启动开发服务器

```bash
pnpm dev
```

| 地址 | 说明 |
|---|---|
| <http://localhost:3000> | 前台站点 |
| <http://localhost:3000/admin> | Payload 后台管理 |

---

## 🧪 演示账号与 Walkthrough

`pnpm reset:seed` 会重建内容、软件、**交易市场**、**悬赏**、订单与平台币流水，并创建下列演示用户（**密码均为 `password`**）：

| 邮箱 | 角色 | 用途 |
|---|---|---|
| 你的管理员账号 | `admin` | 后台管理；种子会尝试将其平台币设为 500 |
| `demo-buyer@example.com` | `user` | 买家：已购 1 个付费资源，并发起 1 个进行中悬赏（含托管流水） |
| `demo-seller@example.com` | `user` | 卖家：有已上架/待审核资源，并对进行中悬赏有 1 份提交 |
| `demo-reviewer@example.com` | `reviewer` | 审核员：可走资源/悬赏/用户审核队列 |
| `demo-author@example.com` | （仅当库中无 admin 时创建） | 文章作者兜底 |

### 10 分钟主路径

1. **内容**：打开 `/posts`、`/topics`、`/software`，确认列表与详情可浏览。
2. **签到**：用 `demo-buyer@example.com` 登录 → `/account` → 每日签到（同一 UTC 日仅一次，+10 平台币）。
3. **市场购买 / 下载**：`/market` → 打开「Next.js 管理后台起步模板」（买家种子已购）→ 走下载；或用管理员购买「站点 VIP 永久会员」观察角色变为 `vip`。
4. **零价资源**：市场中的「免费 UI 图标包」验证 0 币仍生成订单的路径。
5. **悬赏**：`/bounty` → 打开进行中悬赏 → 卖家视角看提交；买家（发起人）可练习采纳（会发放托管）。
6. **审核**：用审核员或管理员处理「待审核」交易资源 / 悬赏。
7. **VIP 软件门槛**：软件「云端笔记」含 `requiredRole: vip` 的下载项，非 VIP 应被拒绝。

领域用语见根目录 [CONTEXT.md](CONTEXT.md)；经济与 VIP 边界见 [docs/adr/0001-demo-virtual-economy.md](docs/adr/0001-demo-virtual-economy.md)。

---

## ⚠️ 已知限制

本仓库定位为**开源演示模板**，不是生产收款系统：

| 项目 | 现状 |
|---|---|
| 支付 | **仅平台币**，无真实充值 / 支付网关 |
| VIP | 购买会员商品后 **永久** `role=vip`，无到期降级 |
| 订单 | 成交即 `paid`，无购物车、无退款纠纷流 |
| 通知 | 以站内通知为主，**无邮件推送** |
| 签到日界 | 按 **UTC** 日期判断「今日是否已签」 |
| 种子脚本 | 需已有管理员；会清空业务集合后重建（保留 admin） |

规划中的评分评价、任务/成就中心等见后续迭代，不在当前种子范围内。

---

## ⚙️ 环境变量

在项目根目录创建 `.env` 文件：

```bash
# ── 数据库 ─────────────────────────────────────────────
# mongodb:// 开头自动使用 MongoDB，否则使用 PostgreSQL
DATABASE_URL=postgres://user:password@localhost:5432/payload_rdl

# ── Payload ────────────────────────────────────────────
# 必填，建议使用 openssl rand -base64 32 生成
PAYLOAD_SECRET=your-long-random-secret

# ── 站点 ───────────────────────────────────────────────
# 用于 SEO、Live Preview、CORS
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# ── 可选 ───────────────────────────────────────────────
# 配合 Vercel Cron 使用的定时任务密钥
CRON_SECRET=your-cron-secret
```

---清空业务数据并导入完整演示种子（保留 admin；含市场/悬赏/订单）

## 📦 部署

### Vercel（推荐）

1. Fork 本仓库，在 Vercel 导入项目
2. 配置上述环境变量（使用 [Neon](https://neon.tech) / [Supabase](https://supabase.com) 或 [MongoDB Atlas](https://www.mongodb.com/atlas) 托管数据库）
3. 在 Vercel 项目设置中配置 Cron Job，路由指向 `/api/cron`，Header 附带 `CRON_SECRET`
4. 部署即可，Vercel 会自动执行 `pnpm build`

### 自托管

```bash
pnpm build      # 生产构建 + 自动生成 sitemap
pnpm start      # 启动生产服务（默认端口 3000）
```

前置 Nginx 反代示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🛠️ 开发指南

### 常用脚本

| 脚本 | 说明 |
|---|---|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 + 生成 sitemap |
| `pnpm start` | 启动生产服务 |
| `pnpm generate:types` | 从集合配置生成 `payload-types.ts` |
| `pnpm generate:importmap` | 生成后台组件 import map |
| `pnpm reset:seed` | ⚠️ 重置数据库并导入种子数据 |
| `pnpm lint` | ESLint 代码检查 |
| `pnpm lint:fix` | ESLint 自动修复 |
| `pnpm test:int` | 运行 Vitest 集成测试 |
| `pnpm test:e2e` | 运行 Playwright 端到端测试 |
| `pnpm test` | 运行全部测试 |

### 官方插件

| 插件 | 用途 |
|---|---|
| `@payloadcms/plugin-seo` | 自动生成标题 / URL / SEO 元信息 |
| `@payloadcms/plugin-search` | 为文章与软件构建全站搜索索引 |
| `@payloadcms/plugin-nested-docs` | 分类的嵌套层级与面包屑 URL 生成 |
| `@payloadcms/richtext-lexical` | Lexical 富文本编辑器 |
| `@payloadcms/live-preview-react` | 前台实时预览 |
| `@payloadcms/admin-bar` | 前台悬浮管理工具条 |

---

## 📄 License

[MIT](LICENSE)
