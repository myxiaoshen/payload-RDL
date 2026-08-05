import type { Endpoint, PayloadRequest } from 'payload'

import { markdownToLexical } from '@/utilities/markdownToLexical'

type CreateBody = {
  type?: 'order' | 'bounty'
  targetId?: string | number
  content?: string
}

const json = (data: unknown, status: number) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

const relId = (value: unknown): number | string | null => {
  if (value == null) return null
  return typeof value === 'object'
    ? (value as { id: number | string }).id
    : (value as number | string)
}

/** 用户发起申诉：订单仅买家、悬赏仅作者；同对象禁止重复 pending/已批准后再开。
 * 路径故意用 /appeal/*（单数），避免与 collections.appeals 的 REST /api/appeals/:id 冲突
 *（/api/appeals/create 会被当成 id="create" 而 404）。
 */
export const appealsCreateEndpoint: Endpoint = {
  path: '/appeal/create',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user) {
      return json({ error: '请先登录' }, 401)
    }

    let body: CreateBody
    try {
      body = (await req.json?.()) as CreateBody
    } catch {
      return json({ error: '请求格式无效' }, 400)
    }

    const type = body?.type
    const targetId = body?.targetId
    const markdown = String(body?.content ?? '').trim()

    if ((type !== 'order' && type !== 'bounty') || targetId == null) {
      return json({ error: '缺少必要参数' }, 400)
    }
    if (!markdown) {
      return json({ error: '请填写申诉详情' }, 400)
    }

    if (type === 'order') {
      const order = await req.payload.findByID({
        collection: 'orders',
        id: targetId,
        depth: 0,
        disableErrors: true,
        overrideAccess: true,
        req,
      })

      if (!order) {
        return json({ error: '订单不存在' }, 404)
      }
      if (order.status !== 'paid') {
        return json({ error: '仅已完成订单可申诉' }, 400)
      }

      const buyerId = relId(order.buyer)
      if (buyerId == null || String(buyerId) !== String(req.user.id)) {
        return json({ error: '只有买家可以对该订单发起申诉' }, 403)
      }
    } else {
      const bounty = await req.payload.findByID({
        collection: 'bounties',
        id: targetId,
        depth: 0,
        disableErrors: true,
        overrideAccess: true,
        req,
      })

      if (!bounty) {
        return json({ error: '悬赏不存在' }, 404)
      }

      const allowed =
        bounty.status === 'open' || bounty.status === 'fulfilled' || bounty.status === 'closed'
      if (!allowed) {
        return json({ error: '当前悬赏状态不可申诉' }, 400)
      }

      const authorId = relId(bounty.author)
      if (authorId == null || String(authorId) !== String(req.user.id)) {
        return json({ error: '只有发起人可以对该悬赏发起申诉' }, 403)
      }
    }

    const targetField = type === 'order' ? 'order' : 'bounty'
    const existing = await req.payload.find({
      collection: 'appeals',
      where: {
        and: [
          { type: { equals: type } },
          { [targetField]: { equals: targetId } },
          {
            or: [{ status: { equals: 'pending' } }, { status: { equals: 'approved' } }],
          },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })

    if (existing.docs.length > 0) {
      const status = existing.docs[0].status
      if (status === 'pending') {
        return json({ error: '该对象已有待处理申诉' }, 400)
      }
      return json({ error: '该对象申诉已批准，不可再次发起' }, 400)
    }

    const content = await markdownToLexical(req, markdown)
    if (!content) {
      return json({ error: '请填写申诉详情' }, 400)
    }

    const appeal = await req.payload.create({
      collection: 'appeals',
      data: {
        type,
        applicant: req.user.id,
        content: content as never,
        status: 'pending',
        settled: false,
        ...(type === 'order' ? { order: targetId as number } : { bounty: targetId as number }),
      },
      depth: 0,
      overrideAccess: true,
      req,
      context: { disableRevalidate: true },
    })

    return json({ appealId: appeal.id, status: 'pending' }, 201)
  },
}
