import type { Endpoint, PayloadRequest } from 'payload'
import { revalidatePath } from 'next/cache'

import { applyCoinDelta } from '@/utilities/coin'
import { notifyUser } from '@/utilities/notify'
import { withTransaction } from '@/utilities/withTransaction'

type CloseBody = {
  bountyId?: string | number
  /** 管理员审核驳回时传 'rejected'，其余默认作者主动关闭 'closed'。 */
  reason?: 'closed' | 'rejected'
}

const json = (data: unknown, status: number) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

const relId = (value: unknown): number | string | null => {
  if (value == null) return null
  return typeof value === 'object'
    ? (value as { id: number | string }).id
    : (value as number | string)
}

/** 关闭/驳回悬赏：未采纳时原子退回冻结的悬赏币给发起人。 */
export const bountyCloseEndpoint: Endpoint = {
  path: '/bounty/close',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user) {
      return json({ error: '请先登录' }, 401)
    }

    let body: CloseBody
    try {
      body = (await req.json?.()) as CloseBody
    } catch {
      return json({ error: '请求格式无效' }, 400)
    }

    const bountyId = body?.bountyId
    if (bountyId == null) {
      return json({ error: '缺少必要参数' }, 400)
    }

    const bounty = await req.payload.findByID({
      collection: 'bounties',
      id: bountyId,
      depth: 0,
      disableErrors: true,
      overrideAccess: true,
      req,
    })

    if (!bounty) {
      return json({ error: '悬赏不存在' }, 404)
    }

    const authorId = relId(bounty.author)
    const isAuthor = authorId != null && String(authorId) === String(req.user.id)
    const isAdmin = req.user.role === 'admin'
    if (!isAuthor && !isAdmin) {
      return json({ error: '无权操作该悬赏' }, 403)
    }

    // 驳回为管理员专属操作；关闭发起人与管理员均可。
    const reason: 'closed' | 'rejected' =
      body.reason === 'rejected' && isAdmin ? 'rejected' : 'closed'

    if (bounty.status === 'fulfilled' || bounty.escrowReleased) {
      return json({ error: '该悬赏已结算，无法关闭' }, 400)
    }

    const reward = bounty.reward ?? 0

    // 结算前收集已提交者，用于关闭后通知。
    const subs = await req.payload.find({
      collection: 'bounty-submissions',
      where: { bounty: { equals: bounty.id } },
      limit: 200,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const submitterIds = subs.docs
      .map((d) => relId(d.submitter))
      .filter((v): v is number | string => v != null)

    const result = await withTransaction(req, async () => {
      await req.payload.update({
        collection: 'bounties',
        id: bounty.id,
        data: { status: reason, escrowReleased: true },
        depth: 0,
        overrideAccess: true,
        req,
        context: { disableRevalidate: true },
      })

      let refundBalance: number | null = null
      if (reward > 0 && authorId != null) {
        refundBalance = await applyCoinDelta(req, {
          userId: authorId,
          amount: reward,
          type: 'bounty-refund',
          note: `悬赏${reason === 'rejected' ? '驳回' : '关闭'}退款：${bounty.title}`,
          relatedBounty: bounty.id,
        })
      }

      return { bountyId: bounty.id, status: reason, refundBalance }
    })

    if (authorId != null) {
      await notifyUser(req, {
        userId: authorId,
        title: reason === 'rejected' ? '悬赏被驳回' : '悬赏已关闭',
        message: `「${bounty.title}」已${reason === 'rejected' ? '被驳回' : '关闭'}，${reward} Coin 已退回余额`,
        link: `/bounty/${bounty.slug}`,
      })
    }
    for (const submitterId of submitterIds) {
      await notifyUser(req, {
        userId: submitterId,
        title: '悬赏已关闭',
        message: `你参与的悬赏「${bounty.title}」已关闭`,
        link: `/bounty/${bounty.slug}`,
      })
    }

    try {
      revalidatePath('/bounty')
      if (bounty.slug) revalidatePath(`/bounty/${bounty.slug}`)
    } catch {
      // revalidate 失败不影响关闭结果
    }

    return json(result, 200)
  },
}
