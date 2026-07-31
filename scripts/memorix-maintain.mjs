#!/usr/bin/env node
// Memorix 记忆治理。默认只做只读体检；只有 --apply 才会合并/归档/删除。
import { spawnSync } from 'node:child_process'

const APPLY = process.argv.includes('--apply')

// 活跃记忆超过 WARN 说明该收口了，超过 FAIL 说明治理已经失效。
const ACTIVE_WARN = 60
const ACTIVE_FAIL = 120
const STALE_WARN = 10

const run = (args) => {
  const res = spawnSync('memorix', args, { encoding: 'utf8', shell: true })
  return { code: res.status ?? 1, out: `${res.stdout ?? ''}${res.stderr ?? ''}`.trim() }
}

const runJson = (args) => {
  const { code, out } = run(args)
  const start = out.indexOf('{')
  const end = out.lastIndexOf('}')
  if (start === -1 || end <= start) return { code, out, data: null }
  try {
    return { code, out, data: JSON.parse(out.slice(start, end + 1)) }
  } catch {
    return { code, out, data: null }
  }
}

const section = (title) =>
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 46 - title.length))}`)

console.log(`Memorix 记忆治理 — ${APPLY ? '执行模式 (会写入)' : '审计模式 (只读)'}`)

section('1. 保留状态')
const retention = runJson(['retention', 'status', '--json'])
const summary = retention.data?.summary
if (!summary) {
  console.log(
    retention.out || 'memorix retention status 无法解析，请确认 memorix 已安装并在 PATH 中。',
  )
  process.exit(1)
}
console.log(
  `活跃 ${summary.active} · 陈旧 ${summary.stale} · 待归档 ${summary.archiveCandidates} · 豁免 ${summary.immune}`,
)

section('2. 重复主题合并')
console.log(run(['memory', 'consolidate', '--action', APPLY ? 'execute' : 'preview']).out)

section('3. 低质量记忆清理')
console.log(run(APPLY ? ['cleanup', '--force', '--noise'] : ['cleanup', '--dry']).out)

if (APPLY) {
  section('4. 归档过期记忆')
  console.log(run(['retention', 'archive']).out)
}

section(`${APPLY ? '5' : '4'}. 健康检查`)
const doctor = run(['doctor'])
console.log(doctor.code === 0 ? 'doctor 通过。' : doctor.out)

section('结论')
const problems = []
if (summary.active >= ACTIVE_FAIL)
  problems.push(`活跃记忆 ${summary.active} 条已超过硬上限 ${ACTIVE_FAIL}`)
else if (summary.active >= ACTIVE_WARN)
  problems.push(`活跃记忆 ${summary.active} 条已超过软上限 ${ACTIVE_WARN}，建议合并同主题条目`)
if (summary.stale >= STALE_WARN)
  problems.push(`陈旧记忆 ${summary.stale} 条，建议 memorix memory resolve 收口`)
if (!APPLY && summary.archiveCandidates > 0)
  problems.push(`有 ${summary.archiveCandidates} 条待归档，运行 pnpm memory:maintain 处理`)

if (problems.length === 0) {
  console.log('记忆库健康，注入预算安全。')
  process.exit(0)
}

problems.forEach((p) => console.log(`- ${p}`))
process.exit(summary.active >= ACTIVE_FAIL ? 1 : 0)
