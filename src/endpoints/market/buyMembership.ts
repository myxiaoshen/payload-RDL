import type { Endpoint, PayloadRequest } from 'payload'

import { applyCoinDelta } from '@/utilities/coin'
import { withTransaction } from '@/utilities/withTransaction'

const json = (data: unknown, status: number) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

/** 购买会员所需的平台币价格。 */
export const MEMBERSHIP_PRICE = 500

/** 使用平台币购买会员：扣币后将角色升级为 VIP（永久）。 */
export const buyMembershipEndpoint: Endpoint = {
  path: '/market/buy-membership',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user) {
      return json({ error: '请先登录' }, 401)
    }

    if (req.user.role === 'admin') {
      return json({ error: '管理员无需购买会员' }, 400)
    }

    if (req.user.role === 'vip') {
      return json({ error: '你已是 VIP 用户' }, 400)
    }

    const buyer = await req.payload.findByID({
      collection: 'users',
      id: req.user.id,
      depth: 0,
      overrideAccess: true,
      req,
    })

    if ((buyer?.coinBalance ?? 0) < MEMBERSHIP_PRICE) {
      return json({ error: '平台币余额不足' }, 400)
    }

    const balance = await withTransaction(req, async () => {
      const next = await applyCoinDelta(req, {
        userId: req.user!.id,
        amount: -MEMBERSHIP_PRICE,
        type: 'membership',
        note: '购买 VIP 会员',
      })

      await req.payload.update({
        collection: 'users',
        id: req.user!.id,
        data: { role: 'vip' },
        depth: 0,
        overrideAccess: true,
        req,
        context: { skipCoinLog: true, disableRevalidate: true },
      })

      return next
    })

    return json({ balance, role: 'vip' }, 200)
  },
}
