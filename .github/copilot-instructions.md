# Memorix — Project Memory Tools

This repository is configured to use Memorix for persistent cross-session memory. For non-trivial coding work, Memory Autopilot is the default entry point before local progress notes or broad file exploration.

## Start with Memory Autopilot

Default first step for non-trivial coding work: call `memorix_project_context` with the user's actual task before progress files, dev-log reads, ad-hoc file reads, or git archaeology. Memorix will choose a task-lensed brief (bugfix, feature, release, onboarding, refactor, docs, test, or general). When the task is continuing prior work, the same brief also includes a bounded prior-work projection. Treat its "Start here" files as the first project files to inspect.

If the MCP tool is not visible yet but the client supports tool discovery or dynamic loading, search/select `memorix_project_context` first. Continuation fallback is mandatory: when the user asks to continue, resume, take over, or explain prior work and MCP cannot be called in this turn, run exactly one CLI brief with the user's real task before inspecting files, Git history, progress notes, or guessing: `memorix resume "<task>" --json`. For a new task, use `memorix context "<task>" --json` instead. The absence of `.memorix` or visible memory files never proves project memory is empty. If that one command fails, report it and proceed normally. Do not probe help, enumerate commands, chain broad searches, wait indefinitely on MCP startup, or hand-write tool-call syntax.

After a successful `memorix_project_context` result, the brief is the default retrieval boundary. Do not call more Memorix retrieval tools after a complete brief. Use `memorix_context_pack`, `memorix_search`, or `memorix_detail` only when the brief lacks a specific reference, freshness field, or fact needed for the task, or when the user explicitly asks for deeper history. In MCP, name that missing fact in `purpose` when intentionally expanding beyond the brief. Do not retrieve the same decision twice just to confirm an already-complete brief.
If the user asks for read-only work or says not to modify files, do not call `memorix_store` just to record an assessment. Store only when the user explicitly asks to preserve it.

## When to search memory

Use `memorix_graph_context` for explicit memory graph questions or broad graph overview after the autopilot brief is not enough.

Use `memorix_search` when prior project context would help and the Autopilot brief did not already answer the question — for example:
- The user asks about a past decision, bug, or change
- You need to understand why something was designed a certain way
- You're continuing work that started in a previous session

You do **not** need to search memory for simple, self-contained tasks (e.g., "fix this typo", "what does this function do").

If no memories exist yet, that’s fine — just proceed normally.

## When to store memory

Use `memorix_store` when you learn something a future session should not have to rediscover:

| What happened | Type |
|---|---|
| Architecture or design decision | `decision` |
| Bug found and fixed | `problem-solution` |
| Non-obvious pitfall or gotcha | `gotcha` |
| Configuration or dependency changed | `what-changed` |
| Trade-off discussed with conclusion | `trade-off` |

**Tips for good memories:**
- Use concise titles (~5-10 words)
- Include `filesModified` when relevant
- Use `topicKey` for topics that evolve over time (prevents duplicates)
- For "why" decisions, use `memorix_store_reasoning`
- For a stable fact, reusable procedure, or completed episode that merits deliberate long-term review, include `longTerm` in `memorix_store` with the appropriate kind and normally `scope: "project"`. It creates a candidate only: do not use it for routine updates, do not make project-derived evidence portable user memory, and do not assume it enters context until an operator qualifies and approves it through `memorix memory long-term`.
- A `user` + `portable` durable memory delivered in a task brief is intentionally available across projects. When it matches the task, use it as reusable background even if its origin differs; do not treat it as a current-project fact. Expand it only when needed with `memorix_detail` using its `durable:<id>` reference and a specific purpose.

**Don't store:** greetings, simple file reads, trivial commands (ls, pwd, git status).

## When to resolve memory

Use `memorix_resolve` when a task is done or a bug is fixed. This keeps future searches focused on active work instead of surfacing completed items.

## 本项目记忆治理规约（token 预算优先）

记忆库允许增长，但注入上下文的量必须恒定。以下规则优先于上面的通用建议。

新记忆必须落在这些前缀下，禁止自造同义前缀（同义词是记忆膨胀的头号原因）：

| 前缀 | 用途 |
|---|---|
| `architecture/` | 结构、模块关系、渲染与缓存机制 |
| `flows/` | 端到端业务流程 |
| `decisions/` | 选型与方案决策 |
| `why/` | 某段设计存在的原因 |
| `trade-off/` | 有结论的取舍 |
| `gotcha/` | 非显而易见的坑 |
| `problem/` | 已定位的问题及其解法 |
| `conventions/` | 开发规范与流程约定 |

同一主题演进时**复用原 topicKey 做 upsert**，不新建条目。

### 写入判定（必须全部满足）

1. 未来某次任务能靠它省下真实的排查或探索时间。
2. 结论已经确定，不是过程记录或猜测。
3. 无法从当前代码一眼看出（能一眼看出的写代码注释，不写记忆）。
4. 标题 5-10 个词，正文聚焦「结论 + 影响面 + 下次怎么用」。

任一条不满足就不要存。

### 禁止写入

一次性命令输出、报错原文粘贴、临时环境状态、无结论的调试过程、
文件内容复述、任务进度播报、会话寒暄。

### 容量红线

- 活跃记忆软上限 60 条，硬上限 120 条。
- 同一 topicKey 超过 5 条必须合并。
- 任务完成或问题修复后立即 `memorix_resolve`，不留悬挂条目。
- 触及上限时**先合并再新增**，不要靠加条目解决。

### 检索纪律

`memorix_project_context` 的简报就是检索边界。只有简报缺少某个具体事实时才追加
`memorix_search` / `memorix_detail`，并在 `purpose` 里写明缺的是什么。
禁止为了「确认一下」重复拉取同一条记忆。

### 维护命令

```bash
pnpm memory:check      # 只读体检：容量、重复、低质量、健康度
pnpm memory:maintain   # 执行治理：合并重复 + 清理低质量 + 归档过期
```

`memory:check` 无副作用，可随时运行；超过硬上限时退出码为 1，可用作提交前门禁。
建议每周或每个较大特性合并后跑一次 `memory:maintain`。

## Tools quick reference

| Tool | Use when |
|---|---|
| `memorix_project_context` | Start or continue coding work with the task-lensed Memory Autopilot brief |
| `memorix_context_pack` | Get structured refs/freshness for code-bound memories |
| `memorix_graph_context` | Build a compact memory graph packet for graph-specific questions |
| `memorix_search` | Find relevant past context |
| `memorix_detail` | Read full content of a specific memory |
| `memorix_store` | Save something worth persisting |
| `memorix_store_reasoning` | Save the "why" behind a decision |
| `memorix_resolve` | Mark completed/outdated memories |
| `memorix_session_start` | Load session context (handoff, orchestration coordination) |
