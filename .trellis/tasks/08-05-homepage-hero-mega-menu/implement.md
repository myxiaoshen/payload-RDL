# Implement: 首页 Hero 一体式侧栏与 hover 菜单

## Preconditions

- 用户已批准本规划摘要
- `python ./.trellis/scripts/task.py start 08-05-homepage-hero-mega-menu`（或 current 指向该任务）后再改产品代码
- 实施前读：`prd.md`、`design.md`、`implement.jsonl` 所列 spec

## Checklist

### 1. CMS Schema

- [x] 扩展 `src/HomepageHero/config.ts`：`menuItems` 增加 `panel`（tagGroups / featureCards）
- [x] 标签与卡片内复用 `link({ appearances: false })`
- [x] 卡片 `thumbnail` → `media`；title 必填；subtitle/badge 可选
- [x] 合理 `maxRows` + admin description；必要时补 RowLabel
- [x] `pnpm generate:types`（及如需 `generate:importmap`）

### 2. 服务端组装

- [x] `Component.tsx`：提高 global depth（如需）、把 panel 传入 client
- [x] `defaults.ts`：兼容无 panel；可选最小示例
- [x] 本地类型与 `HomepageHeroMenuItem` 对齐

### 3. 前台一体布局 + Mega

- [x] 重写 `Component.client.tsx` 布局为单容器侧栏+舞台
- [x] 深色侧栏样式；整行 `CMSLink` 主跳转
- [x] 桌面 hover 状态、hover root leave 关闭、无 panel 不展开
- [x] MegaPanel：tagGroups + featureCards（Media + 文案 + 链接）
- [x] 打开面板时 pause autoplay
- [x] 移动端：无面板，仅列表+轮播
- [x] 保留 slides 图/视频/箭头/指示点

### 4. 校验

- [ ] 后台能编辑并保存 panel 字段
- [ ] 桌面 hover / 离开 / 无 panel 行为
- [ ] 移动端布局与点击
- [ ] 轮播 autoplay 与视频 slide
- [x] lint / typecheck 相关文件；`get_errors` 或项目等价检查

### 5. 收尾（Finish 阶段，非本步强制）

- [ ] 若有可沉淀约定，更新 `.trellis/spec`
- [ ] commit（经 finish-work 流程）

## Validation Commands

```bash
pnpm generate:types
pnpm exec tsc --noEmit
# 或项目既有 lint；开发时 pnpm dev 手测首页
```

手测矩阵：

| 场景 | 期望 |
|------|------|
| 旧菜单仅 link | 侧栏可点，无面板 |
| 有 tag+card | 桌面 hover 显示，离开关闭 |
| 点菜单主链 | 正常跳转 |
| 窄屏 | 无面板，链接可点 |
| 多 slide autoplay | 悬停舞台暂停；离开面板后恢复 |

## Review Gates

- Schema 无自动 software relationship
- 不破坏 `revalidateHomepageHero`
- 不把 panel 逻辑塞进 Header

## Rollback Points

1. Schema 保存后、前台未改：后台多字段但前台忽略 → 低风险
2. 前台改后：回退 client 组件即可恢复旧 UI
