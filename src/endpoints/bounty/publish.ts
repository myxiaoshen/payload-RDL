import type { Endpoint, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'

import { applyCoinDelta } from '@/utilities/coin'
import { markdownToLexical } from '@/utilities/markdownToLexical'
import { withTransaction } from '@/utilities/withTransaction'

type PublishBody = {
  title?: string
  summary?: string
  reward?: number | string
  category?: string | number
  coverImage?: string | number
  description?: string
  deadline?: string
}

const json = (data: unknown, status: number) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

// 前端表单以字符串传关系 id，Postgres 需数字；纯数字串转 number，其余（如 mongo id）原样。
const toId = (value: string | number): number | string => {
  const s = String(value)
  return /^\d+$/.test(s) ? Number(s) : s
}

/** 发布悬赏：校验余额后原子创建悬赏（待审核）并冻结悬赏币。 */
export const bountyPublishEndpoint: Endpoint = {
  path: '/bounty/publish',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user) {
      return json({ error: '请先登录' }, 401)
    }

    let body: PublishBody
    try {
      body = (await req.json?.()) as PublishBody
    } catch {
      return json({ error: '请求格式无效' }, 400)
    }

    const title = String(body?.title ?? '').trim()
    const summary = String(body?.summary ?? '').trim()
    const reward = Math.floor(Number(body?.reward ?? 0))

    if (!title || !summary) {
      return json({ error: '请填写标题与简介' }, 400)
    }
    if (!Number.isFinite(reward) || reward < 1) {
      return json({ error: '悬赏金额至少为 1 Coin' }, 400)
    }

    const publisher = await req.payload.findByID({
      collection: 'users',
      id: req.user.id,
      depth: 0,
      overrideAccess: true,
      req,
    })

    if ((publisher?.coinBalance ?? 0) < reward) {
      return json({ error: '平台币余额不足' }, 400)
    }

    // Markdown → Lexical 在事务外转换，避免拉长事务持有时间。
    const description = await markdownToLexical(req, body.description)

    const result = await withTransaction(req, async () => {
      // slug 由集合 beforeValidate 钩子自动补齐，这里无需提供。
      type BountyCreate = RequiredDataFromCollectionSlug<'bounties'>
      const data: Omit<BountyCreate, 'slug'> & Partial<Pick<BountyCreate, 'slug'>> = {
        title,
        summary,
        reward,
        author: req.user!.id,
        status: 'pending',
        escrowReleased: false,
        submissionCount: 0,
      }
      if (body.category) data.category = toId(body.category) as number
      if (body.coverImage) data.coverImage = toId(body.coverImage) as number
      if (body.deadline) data.deadline = body.deadline
      if (description) data.description = description as BountyCreate['description']

      const bounty = await req.payload.create({
        collection: 'bounties',
        data: data as BountyCreate,
        depth: 0,
        overrideAccess: true,
        req,
        context: { disableRevalidate: true },
      })

      const balance = await applyCoinDelta(req, {
        userId: req.user!.id,
        amount: -reward,
        type: 'bounty-escrow',
        note: `发布悬赏冻结：${title}`,
        relatedBounty: bounty.id,
      })

      return { bountyId: bounty.id, slug: bounty.slug, balance }
    })

    return json(result, 200)
  },
}
