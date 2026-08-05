# Design: 首页 Hero 一体式侧栏与 hover 菜单

## Scope

在现有 Global `homepage-hero` 与 `src/HomepageHero/*` 内完成：

1. CMS：菜单项扩展纯手动详情字段
2. 前台：一体式布局 + 桌面 hover mega 面板
3. 类型与 revalidate 保持现有 Global 钩子路径

不新建 Global；不改页眉；不接 software 自动查询。

## Current Architecture

```
HomepageHero (RSC)
  → getCachedGlobal('homepage-hero')
  → HomepageHeroClient (client)
       grid: aside(menu links) | carousel(slides)
```

## Target Architecture

```
HomepageHero (RSC)
  → getCachedGlobal depth 足够填充 media + link reference
  → 规范化 menuItems / slides（空则 defaults）
  → HomepageHeroClient
       一体容器
         ├─ Sidebar (深色，主 link 整行可点)
         └─ Stage
              ├─ Carousel (现有)
              └─ MegaPanel (desktop only, hover)
                   ├─ tagGroups[]
                   └─ featureCards[]
```

## CMS Schema（menuItems 扩展）

保持顶层：`menuItems`, `slides`, `autoplay`, `autoplayIntervalMs`。

每个 `menuItems[]` 项：

| 字段 | 类型 | 说明 |
|------|------|------|
| `link` | 现有 `link({ appearances: false })` | 主链接，必填语义不变 |
| `panel.tagGroups` | array | 分组；空则不算有标签区 |
| `panel.tagGroups[].title` | text | 分组标题，如「前沿技术」 |
| `panel.tagGroups[].tags` | array | 标签项 |
| `panel.tagGroups[].tags[].link` | link | 标签文字与跳转 |
| `panel.featureCards` | array | 推荐卡片 |
| `panel.featureCards[].thumbnail` | upload→media | 可选缩略图 |
| `panel.featureCards[].title` | text | 必填 |
| `panel.featureCards[].subtitle` | text | 可选副文案 |
| `panel.featureCards[].badge` | text | 可选角标（如「实战」） |
| `panel.featureCards[].link` | link | 卡片跳转 |

实现注意：

- 用 `group` 名 `panel` 收拢详情，后台更清晰；也可扁平字段，优先 `panel` 分组
- `maxRows` 建议：菜单 ≤12；每项 tagGroups ≤6；每组 tags ≤12；featureCards ≤8
- RowLabel：菜单继续用 link.label；可为 tagGroup / featureCard 补简单 RowLabel（可选）
- 旧数据无 `panel`：前台视为无详情

## Frontend Layout

### Desktop（md+）

- 单一 `relative overflow-hidden rounded-xl border shadow` 容器
- 内部 `flex`：固定宽侧栏（约 240–280px）+ `flex-1` 舞台
- 侧栏：深色底、白/浅字、项间分隔或 hover 高亮；右侧小箭头暗示可展开
- 舞台：轮播 `aspect` 保持；mega 面板 `absolute inset-0`（或 inset 于舞台）盖在轮播上，`z-index` 高于箭头/指示点交互时需避免误触——悬停打开时暂停 autoplay（已有 pause 机制可复用）
- 打开条件：`activeMenuIndex !== null` 且该项 `hasPanelContent`

### Mobile

- 垂直堆叠：轮播在上或菜单在上均可，优先与现网一致（现网 mobile 轮播 order 在前）
- 菜单为普通链接列表；**不挂载** hover 面板逻辑（`md:` 或 matchMedia / 仅桌面 pointer）
- 不使用 hover 媒体查询作为唯一手段时，至少用 `md+` 布局分支隐藏面板

### Hover 行为

- `onPointerEnter` 菜单项 → set active index
- 侧栏与舞台（含面板）同属 hover root：`onPointerLeave` 清空
- 无 panel 的项：可高亮但不渲染面板
- 点击主 link 正常导航（不要用 `preventDefault` 挡跳转）

## Data Flow

1. Admin 保存 Global → `revalidateHomepageHero` 已有
2. RSC `getCachedGlobal('homepage-hero', depth)`：`depth` 需 ≥1 以展开 media 与 reference slug；若 reference 嵌套不够再调高
3. Client 只消费已 resolve 的 props，不在浏览器请求 Payload

## Types

- 扩展 `HomepageHeroMenuItem` 本地类型与 `Component.client` props
- 跑 `pnpm generate:types` 更新 `payload-types.ts`
- defaults：可只保留主 link；panel 可选示例 1 项便于空站预览（可选，非必须）

## Reuse

- `link` field factory
- `CMSLink` / `Media`
- 现有 slide 渲染与 autoplay 计时器
- **不**复用 `SoftwareCard` 作为面板卡片（字段是手动运营位，用轻量自定义卡片更贴样图）

## Risks & Mitigations

| 风险 | 缓解 |
|------|------|
| 面板挡住轮播控件 | 打开面板时提高面板优先级并暂停 autoplay；关闭后恢复 |
| depth 不足导致无图/无 reference | 服务端 depth 与类型守卫；无 url 的 link 不渲染 |
| 后台字段过深难编 | panel 分组 + initCollapsed + RowLabel |
| 移动误触 hover | 仅 md+ 启用面板状态 |

## Rollback

- 回退 `HomepageHero` config + client 组件即可；旧菜单 link 数据仍有效
- 新 panel 字段残留在 DB 无害

## Non-goals

- 像素级视觉
- a11y 完整 roving tabindex mega menu
- 自动 software 关联
