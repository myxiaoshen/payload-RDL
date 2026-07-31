import type { Endpoint, PayloadRequest } from 'payload'

import { applyCoinDelta } from '@/utilities/coin'
import { withTransaction } from '@/utilities/withTransaction'

type PurchaseBody = { resourceId?: string | number }

const json = (data: unknown, status: number) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

const relId = (value: unknown): number | string | null => {
  if (value == null) return null
  return typeof value === 'object'
    ? (value as { id: number | string }).id
    : (value as number | string)
}

/** 购买资源：校验后原子扣币、给作者结算、生成订单并累加销量。 */
export const purchaseEndpoint: Endpoint = {
  path: '/market/purchase',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user) {
      return json({ error: '请先登录' }, 401)
    }

    let body: PurchaseBody
    try {
      body = (await req.json?.()) as PurchaseBody
    } catch {
      return json({ error: '请求格式无效' }, 400)
    }

    const resourceId = body?.resourceId
    if (resourceId == null) {
      return json({ error: '缺少必要参数' }, 400)
    }

    const resource = await req.payload.findByID({
      collection: 'market-resources',
      id: resourceId,
      depth: 0,
      disableErrors: true,
      overrideAccess: true,
      req,
    })

    if (!resource || resource.status !== 'approved') {
      return json({ error: '资源不存在或未上架' }, 404)
    }

    const sellerId = relId(resource.author)
    if (sellerId != null && String(sellerId) === String(req.user.id)) {
      return json({ error: '不能购买自己发布的资源' }, 400)
    }

    const existing = await req.payload.find({
      collection: 'orders',
      where: {
        and: [{ buyer: { equals: req.user.id } }, { resource: { equals: resourceId } }],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })

    if (existing.docs.length > 0) {
      return json({ error: '你已购买过该资源', alreadyOwned: true }, 400)
    }

    const price = resource.price ?? 0

    const buyer = await req.payload.findByID({
      collection: 'users',
      id: req.user.id,
      depth: 0,
      overrideAccess: true,
      req,
    })

    if ((buyer?.coinBalance ?? 0) < price) {
      return json({ error: '平台币余额不足' }, 400)
    }

    const result = await withTransaction(req, async () => {
      const order = await req.payload.create({
        collection: 'orders',
        data: {
          buyer: req.user!.id,
          resource: resourceId as number,
          resourceTitle: resource.title,
          seller: sellerId as number,
          price,
          status: 'paid',
        },
        depth: 0,
        overrideAccess: true,
        req,
        context: { disableRevalidate: true },
      })

      const balance = await applyCoinDelta(req, {
        userId: req.user!.id,
        amount: -price,
        type: 'purchase-spend',
        note: `购买资源：${resource.title}`,
        relatedOrder: order.id,
      })

      if (price > 0 && sellerId != null) {
        await applyCoinDelta(req, {
          userId: sellerId,
          amount: price,
          type: 'sale-income',
          note: `资源售出：${resource.title}`,
          relatedOrder: order.id,
        })
      }

      await req.payload.update({
        collection: 'market-resources',
        id: resourceId,
        data: { salesCount: (resource.salesCount ?? 0) + 1 },
        depth: 0,
        overrideAccess: true,
        req,
        context: { disableRevalidate: true },
      })

      return { orderId: order.id, balance }
    })

    return json(result, 200)
  },
}
