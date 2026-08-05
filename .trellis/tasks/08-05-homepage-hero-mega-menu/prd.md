# 首页 Hero 一体式侧栏与 hover 菜单

## Goal

把首页 Hero 从「左右两列独立卡片」改成样图式一体容器：左侧深色分类菜单与右侧轮播无缝贴合；菜单项悬停时展开详情面板，展示更多软件/内容；详情内容可在后台「首页 Hero」全局中纯手动编辑。

## Background（仓库证据）

- 前台：`src/HomepageHero/Component.client.tsx` — 两列独立卡片 + 简单 `CMSLink` 菜单，无 hover 面板
- 服务端：`src/HomepageHero/Component.tsx` + `defaults.ts` — 空配置回退默认链接/占位轮播
- 后台：`src/HomepageHero/config.ts`（Global `homepage-hero`）— `menuItems[]` 仅 `link`
- 可复用：`src/fields/link.ts`、`MenuRowLabel`/`SlideRowLabel`、现有轮播逻辑；**不**自动拉 software 列表

## Requirements

### R1. 一体式视觉布局

- 桌面：左侧菜单 + 右侧轮播在同一外轮廓容器内，无中间断层间距
- 左侧深色导航风格（接近样图，非 1:1 像素复刻）
- 右侧保留现有轮播（图片/视频、autoplay、箭头、指示点）
- 移动端：仅菜单链接列表 + 轮播；不展示 hover 详情

### R2. 桌面 hover 详情面板

- 悬停菜单项时在轮播区域上展开 mega 面板
- 结构：
  - 上：分组标签链接（多分组，每组标题 + 若干文字链接）
  - 下：推荐卡片（缩略图、标题、副文案、可选角标、跳转）
- hover bridge：菜单项 ↔ 面板移动不关闭；离开容器关闭
- 无详情数据的菜单项：不展开面板，仅作链接
- 键盘：菜单主链接可聚焦/激活；完整键盘漫游 mega 为非 MVP

### R3. 后台纯手动编辑

- Global「首页 Hero」每个菜单项可编辑详情
- 字段覆盖：主链接、分组标签、推荐卡片
- 复用 `link` 字段与 array + RowLabel 模式
- 不关联 software / software-categories 自动取数

### R4. 菜单主链接

- **整行可点跳转**；每项保留主 `link`（与现状一致）
- 桌面：点击跳转 + hover 展开（有详情时）
- 移动端：点击跳转

### R5. 兼容

- 旧 `menuItems` 仅含 `link` 时安全读取，无面板
- 轮播与 autoplay 不回归

## Decisions Made

1. 详情数据来源 = **纯手动**
2. 面板结构 = **标签分组 + 带图推荐卡片**
3. 移动端 = **仅列表，不展开**
4. 主链接 = **整行可点，必有主 link**

## Out of Scope

- 样图像素级复刻 / 促销动效
- 移动端点击展开或抽屉 mega menu
- 页眉导航共用数据
- 自动从 software 库填充面板

## Acceptance Criteria

- [ ] 桌面 Hero 一体式侧栏+轮播，无两卡断层
- [ ] 悬停有详情的菜单项显示「标签 + 卡片」面板；移出关闭
- [ ] 后台可为每项编辑分组标签与推荐卡片，保存后前台可见
- [ ] 无详情菜单项仍整行可点跳转
- [ ] 轮播（图/视频/自动切换）不回归
- [ ] 移动端仅列表+轮播，无 hover 面板，布局可用

## Notes

- 实现前需 `design.md` + `implement.md`，用户批准规划摘要后再 `task.py start`
