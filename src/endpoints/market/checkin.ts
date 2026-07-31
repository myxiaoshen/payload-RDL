import type { Endpoint, PayloadRequest } from 'payload'

import { applyCoinDelta } from '@/utilities/coin'
import { withTransaction } from '@/utilities/withTransaction'

const json = (data: unknown, status: number) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

/** 每日签到奖励的平台币数量。 */
const SIGNIN_REWARD = 10

const todayKey = (value?: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : ''

/** 每日签到：同一天仅可签到一次，成功后发放平台币。 */
export const checkinEndpoint: Endpoint = {
  path: '/market/checkin',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user) {
      return json({ error: '请先登录' }, 401)
    }

    const user = await req.payload.findByID({
      collection: 'users',
      id: req.user.id,
      depth: 0,
      overrideAccess: true,
      req,
    })

    const today = new Date().toISOString().slice(0, 10)
    if (todayKey(user?.lastSigninAt) === today) {
      return json({ error: '今日已签到' }, 400)
    }

    const balance = await withTransaction(req, async () => {
      await req.payload.update({
        collection: 'users',
        id: req.user!.id,
        data: { lastSigninAt: new Date().toISOString() },
        depth: 0,
        overrideAccess: true,
        req,
        context: { skipCoinLog: true, disableRevalidate: true },
      })

      return applyCoinDelta(req, {
        userId: req.user!.id,
        amount: SIGNIN_REWARD,
        type: 'signin',
        note: '每日签到',
      })
    })

    return json({ balance, reward: SIGNIN_REWARD }, 200)
  },
}
