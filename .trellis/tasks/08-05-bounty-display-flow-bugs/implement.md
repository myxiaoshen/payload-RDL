# Implement: 悬赏展示与流程状态修复

## Preflight

- [x] 确认任务仍为 `08-05-bounty-display-flow-bugs`，`task.py start` 后再改业务代码
- [x] 阅读 `prd.md` + `design.md`
- [x] 按 trellis-before-dev 拉取相关 spec（frontend / guides）

## Checklist

### A. 公共用户展示工具

- [x] 新增 `src/utilities/publicUserProfile.ts`
  - `displayName`: `name.trim()` → `用户${id}`
  - 批量 resolve，overrideAccess，只返回 id/displayName/avatar
- [ ] （可选）极小单测或纯函数测 displayName 规则

### B. 发起人匿名修复

- [x] `src/app/(frontend)/bounty/page.tsx`：列表 docs 批量补齐 author 公开资料后传给卡片
- [x] `src/components/Bounty/BountyCard.tsx`：使用 displayName，去掉 email 回退
- [x] `src/app/(frontend)/bounty/[slug]/page.tsx`：header 发起人使用 PublicUserProfile
- [x] 保持 `isOwner` 基于 author id，不依赖 populate 成功

### C. 参与结果全员可见

- [x] 详情页对公开悬赏（非仅 owner）加载 submissions（服务端 overrideAccess）
- [x] 映射安全 DTO：默认不含 content/note/downloadFile；owner（及可选本人）附加 content/note
- [x] 批量 resolve submitter 头像与 displayName
- [x] 详情「收到的方案/参与者」区块对所有人渲染
- [x] 更新 `SubmissionList`：头像 + 系统文案；操作按钮仍 `isOwner` 门控
- [x] 确认未把 downloadFile 传入客户端 props

### D. 状态同步与操作区

- [x] 核实 accept/close 成功后详情 status 文案与 `canAccept`/关闭按钮
- [x] 在 accept/close/submit 成功路径增加 `revalidatePath('/bounty')` 与 `revalidatePath(/bounty/${slug})`（注意 endpoint 内可用 next/cache）
- [x] 非 open 状态侧栏提交区文案正确（不可再交 / 已结束）
- [x] 列表卡片 status 标签含 fulfilled/closed（已有则核对文案）

### E. 权限与回归

- [x] 不修改 `users.access.read` 为 anyone
- [x] 不放宽 `bounty-submissions` 匿名 REST 枚举（除非 design 变更）
- [x] 下载端点行为不变
- [ ] 发起人采纳/关闭、参与者提交、alreadySubmitted 回归

### F. 收尾

- [ ] `pnpm exec tsc --noEmit` 或项目惯用 typecheck（终端多次中断，IDE diagnostics 无报错）
- [ ] 相关 eslint / 手动验收 PRD Acceptance Criteria
- [x] 若改 collection schema 才 `pnpm run generate:types`（本任务预期可不改 schema）

## Validation commands

```bash
pnpm exec tsc --noEmit
# 可选：pnpm test:int / 手动打开 /bounty 与 /bounty/[slug]
```

手动场景：

1. 未登录：列表+详情发起人显示名正确；可见参与者名/头像/状态；不可见下载链
2. 发起人：采纳 → 状态已完成；一人已采纳、其余未采纳系统文案；不可再采纳
3. 发起人：关闭 → 已关闭
4. 路人：仅浏览，无采纳按钮

## Review gates

- 隐私：无 email、无 downloadFile 进公开 props
- 产品：R3=A、系统文案、显示名 Y
- 不顺带改 market（除非只导出公共工具）

## Rollback points

- 回滚 `publicUserProfile` 调用与 SubmissionList 公开渲染即可恢复旧行为
- 无 DB migration

## Notes for implement subagent

- Active task: `.trellis/tasks/08-05-bounty-display-flow-bugs`
- 先工具与 DTO，再页面，再 endpoint revalidate
- 禁止 `users.read = anyone` 捷径
