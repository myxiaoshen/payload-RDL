# Design: 悬赏展示与流程状态修复

## 1. Problem Summary

- 发起人在列表/详情恒为「匿名」：`users.read = authenticated`，前台 `depth:1` 展开 `author` 时无 user 上下文，关系降级为 id，UI 回退「匿名」。
- 参与结果不对访客可见：详情仅 `isOwner` 时加载提交列表；与已确认 R3=A 不符。
- 完成后状态观感异常：accept/close 后端会写 `fulfilled/closed`，前端 `router.refresh()`；详情 `force-dynamic` 且无 bounty revalidate hook。需在实现中验证并补强「写后必读到新 status」路径（含列表筛选默认只看 open 的观感）。

## 2. Product Decisions (locked)

| 项 | 决策 |
|---|---|
| 参与信息可见范围 | A 全员公开（访客可见） |
| 驳回说明 | 仅系统文案，无自由文本字段 |
| 显示名回退 | `name` → `用户{id}`；不公开 email |
| 下载直链 | 仍仅授权端点；不因公开展示而暴露 |

## 3. Boundaries

### In scope

- 悬赏列表/详情发起人公开资料展示
- 详情页对所有人展示参与者公开资料 + 状态系统文案
- 采纳/关闭后详情状态与操作区正确
- 不放宽 `users` 集合整体 read

### Out of scope

- 市场作者匿名（可复用工具但本任务不改 market UI）
- 审核/方案自由文本原因
- 发布/支付主流程重构
- 管理后台大改

## 4. Public profile contract

新增可复用工具（建议路径 `src/utilities/publicUserProfile.ts`）：

```ts
type PublicUserProfile = {
  id: string | number
  displayName: string // name.trim() || `用户${id}`
  avatar?: Media | null // 仅公开 media；media.read=anyone
}

resolvePublicUserProfile(payload, userRef, req?): Promise<PublicUserProfile | null>
resolvePublicUserProfiles(payload, userRefs, req?): Promise<Map<id, PublicUserProfile>>
```

实现要点：

- 用 `overrideAccess: true` + 适当 depth 读取 users，**只映射** id / name / avatar。
- 禁止把 email、coinBalance、role 等传入前端 props。
- 批量去重 id，避免 N+1（列表页多卡、详情多提交）。

与 Posts `populatedAuthors` 的关系：

- 不直接改 posts；新工具语义对齐「安全公开字段」。
- 悬赏可不落库 `populatedAuthor` 字段：服务端页面/卡片组装即可，减少 schema 变更。
- 若希望 REST `/api/bounties?depth=1` 也带公开作者，可加 bounties `afterRead` 挂载 `populatedAuthor`；**本任务以 Next 前台修复为验收主路径**，afterRead 作为可选增强（改动面可控则做）。

## 5. Data flow

### 5.1 发起人（列表 + 详情）

```
payload.find(bounties, depth 可保留 cover 等)
  → 收集 author ids
  → resolvePublicUserProfiles
  → BountyCard / 详情 header 使用 displayName（+ 可选头像）
```

身份判断 `isOwner` 继续用 `relId(bounty.author)` 与当前 user.id 比较，**不依赖** author 是否已 populate 成对象。

### 5.2 参与列表（详情，R3=A）

```
bounty 已通过公开 where（open|fulfilled|closed）加载成功
  → 服务端 overrideAccess 拉取该 bounty 的 submissions（limit 合理上限，如 100）
  → 映射安全 DTO 后传给客户端 SubmissionList
  → 批量 resolve submitter profiles（name/avatar）
```

**安全 DTO（传给客户端）**

| 字段 | 访客 | 发起人/管理员 | 提交者本人 |
|---|---|---|---|
| id / status / createdAt | ✓ | ✓ | ✓ |
| submitter displayName / avatar | ✓ | ✓ | ✓ |
| system status label | ✓ | ✓ | ✓ |
| content / note | ✗（默认） | ✓ | 仅自己的 ✓ |
| downloadFile / url | ✗ | 仅已采纳且走下载端点 | 仅走下载端点 |

说明：PRD 要求公开的是参与身份与结果，不是交付物正文/附件。正文对发起人评审仍必要；对路人默认隐藏，降低方案抄袭与信息泄露。若后续要「方案说明也公开」可另开需求。

系统文案：

- submitted → 待处理
- accepted → 已采纳
- rejected → 未采纳（可附短说明「已选择其他方案」）

### 5.3 REST access 策略

- `bounty-submissions.read` **保持**「登录用户仅本人提交 + admin」为主，不把 submissions 全集对匿名 REST 打开。
- 公开展示只走 **Server Component + overrideAccess + DTO 白名单**，避免 `/api/bounty-submissions` 被枚举下载字段。
- `downloadFile` 字段 access 维持 admin；下载继续走 `/api/bounty/submission-download`。

### 5.4 状态同步（采纳/关闭后）

根因排查清单（实现时按序验证）：

1. accept/close 响应是否 200 且 DB 中 status 已变。
2. `router.refresh()` 后详情 RSC 是否读到新 status（`force-dynamic` 下应可以）。
3. 列表默认 `status=open`，完成后卡片从默认列表消失——需在 UI 上避免「像没完成」：详情状态文案/徽章必须正确。
4. 端点里 `context.disableRevalidate: true`：bounties 当前无 revalidate hook，影响有限；建议在 accept/close/submit **成功返回前** 对 Next 显式 `revalidatePath(/bounty/[slug])` 与 `revalidatePath(/bounty)`。
5. 操作区绑定真实 status：`canAccept = status===open && !escrowReleased`；fulfilled 后隐藏关闭/采纳。

## 6. UI changes

- `BountyCard`：发起人用 PublicUserProfile.displayName；可选极小头像（非必须，详情优先）。
- 详情 header：发起人 displayName；status 徽章对 open/fulfilled/closed 明确。
- `SubmissionList`：
  - 始终可渲染公开列表（不再整块 `isOwner &&` 包死）。
  - 每项：头像 + displayName + 系统状态文案。
  - `isOwner` 仅控制采纳/下载按钮与 content/note 展示。
- 侧栏：非进行中时提交表单展示不可提交原因（已有 alreadySubmitted 等，按 status 补强）。

## 7. Compatibility & risks

- **隐私**：禁止 email 回退；overrideAccess 仅服务端。
- **枚举风险**：不开放 submissions 匿名 REST。
- **性能**：列表页批量 resolve authors；详情提交 ≤100 + 批量 submitter。
- **类型**：若增加 afterRead 虚拟字段需 `generate:types`；若仅页面组装 DTO 可少改 payload-types。
- **回归**：发起人采纳/下载/关闭；提交者提交与 alreadySubmitted；未登录浏览列表详情。

## 8. Rollout / rollback

- 纯代码行为修复，无迁移（不新增原因字段）。
- 回滚：恢复详情仅 owner 加载提交、恢复 name||email||匿名 即可。
- 无需 feature flag。

## 9. Validation strategy

- 未登录打开列表+详情，发起人非固定「匿名」（有 name 显示 name，无 name 显示用户{id}）。
- 发起人采纳后 refresh：状态已完成；一人已采纳、他人未采纳系统文案；不可再采纳。
- 关闭后：已关闭；退币逻辑保持既有 endpoint。
- 未登录可见参与者头像/名/状态；响应/DOM 无 download url、无 email。
- lint/tsc；可选补 displayName 纯函数测试。
