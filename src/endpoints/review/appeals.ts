import type { Endpoint, PayloadRequest } from 'payload'

import { applyCoinDelta } from '@/utilities/coin'
import { notifyUser } from '@/utilities/notify'
import { withTransaction } from '@/utilities/withTransaction'

type ReviewBody = {
  id?: string | number
  action?: 'approve' | 'reject'
  amount?: number | string
  note?: string
}

const json = (data: unknown, status: number) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

const relId = (value: unknown): number | string | null => {
  if (value == null) return null
  return typeof value === 'object'
    ? (value as { id: number | string }).id
    : (value as number | string)
}

/** 审核申诉：驳回仅改状态；批准时按订单/悬赏矩阵退币并尽量追回对方。 */
export const reviewAppealsEndpoint: Endpoint = {
  path: '/review/appeals',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'reviewer')) {
      return json({ error: '无权限执行此操作' }, 403)
    }

    let body: ReviewBody
    try {
      body = (await req.json?.()) as ReviewBody
    } catch {
      return json({ error: '请求格式无效' }, 400)
    }

    const { id, action } = body ?? {}
    const note = String(body?.note ?? '').trim()

    if (id == null || (action !== 'approve' && action !== 'reject')) {
      return json({ error: '缺少必要参数' }, 400)
    }

    const appeal = await req.payload.findByID({
      collection: 'appeals',
      id,
      depth: 0,
      disableErrors: true,
      overrideAccess: true,
      req,
    })

    if (!appeal) {
      return json({ error: '申诉不存在' }, 404)
    }

    if (appeal.status !== 'pending' || appeal.settled) {
      return json({ error: '该申诉不在待处理状态' }, 400)
    }

    const applicantId = relId(appeal.applicant)
    if (applicantId == null) {
      return json({ error: '申诉发起人无效' }, 400)
    }

    if (action === 'reject') {
      await req.payload.update({
        collection: 'appeals',
        id,
        data: {
          status: 'rejected',
          reviewNote: note || undefined,
          reviewedBy: req.user.id,
          reviewedAt: new Date().toISOString(),
        },
        depth: 0,
        overrideAccess: true,
        req,
        context: { disableRevalidate: true },
      })

      await notifyUser(req, {
        userId: applicantId,
        title: '申诉已驳回',
        message: note ? `你的申诉已被驳回。处理说明：${note}` : '你的申诉已被驳回。',
        link: '/account?tab=appeals',
      })

      return json({ success: true, status: 'rejected' }, 200)
    }

    const amount = Number(body?.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return json({ error: '请填写有效的退款金额' }, 400)
    }

    let cap = 0
    let orderId: number | string | null = null
    let bountyId: number | string | null = null
    let clawbackUserId: number | string | null = null
    let isMembershipOrder = false
    let bountyNeedsEscrowRelease = false
    let targetLabel = '申诉对象'

    if (appeal.type === 'order') {
      orderId = relId(appeal.order)
      if (orderId == null) {
        return json({ error: '关联订单无效' }, 400)
      }

      const order = await req.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 1,
        disableErrors: true,
        overrideAccess: true,
        req,
      })

      if (!order) {
        return json({ error: '关联订单不存在' }, 404)
      }

      cap = order.price ?? 0
      targetLabel = order.resourceTitle || `订单 #${orderId}`

      const resource = order.resource
      if (resource && typeof resource === 'object') {
        isMembershipOrder = resource.productType === 'membership'
      } else if (resource != null) {
        const resDoc = await req.payload.findByID({
          collection: 'market-resources',
          id: relId(resource) as number,
          depth: 0,
          disableErrors: true,
          overrideAccess: true,
          req,
        })
        isMembershipOrder = resDoc?.productType === 'membership'
      }

      if (!isMembershipOrder) {
        clawbackUserId = relId(order.seller)
      }
    } else {
      bountyId = relId(appeal.bounty)
      if (bountyId == null) {
        return json({ error: '关联悬赏无效' }, 400)
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
        return json({ error: '关联悬赏不存在' }, 404)
      }

      cap = bounty.reward ?? 0
      targetLabel = bounty.title || `悬赏 #${bountyId}`

      if (!bounty.escrowReleased) {
        // 未结算：从平台托管退给发起人，并标记已释放，避免 close 再退一次
        bountyNeedsEscrowRelease = true
      } else if (bounty.acceptedSubmission) {
        const submissionId = relId(bounty.acceptedSubmission)
        if (submissionId == null) {
          return json({ error: '无法定位获奖者，请人工处理' }, 400)
        }
        const submission = await req.payload.findByID({
          collection: 'bounty-submissions',
          id: submissionId,
          depth: 0,
          disableErrors: true,
          overrideAccess: true,
          req,
        })
        clawbackUserId = relId(submission?.submitter)
        if (clawbackUserId == null) {
          return json({ error: '无法定位获奖者，请人工处理' }, 400)
        }
      } else {
        // 已释放且无获奖者（常见于 close 已退发起人）：禁止自动再退，避免双退
        return json({ error: '该悬赏托管已释放且无获奖者，无法自动退币，请人工处理' }, 400)
      }
    }

    if (amount > cap) {
      return json({ error: `退款金额不能超过原交易额 ${cap} Coin` }, 400)
    }

    try {
      await withTransaction(req, async () => {
        // 事务内再读，挡住并发双批准 / 与 close 交叉双退
        const fresh = await req.payload.findByID({
          collection: 'appeals',
          id,
          depth: 0,
          overrideAccess: true,
          req,
        })
        if (!fresh || fresh.status !== 'pending' || fresh.settled) {
          throw new Error('该申诉不在待处理状态')
        }

        if (bountyNeedsEscrowRelease && bountyId != null) {
          const liveBounty = await req.payload.findByID({
            collection: 'bounties',
            id: bountyId,
            depth: 0,
            overrideAccess: true,
            req,
          })
          if (!liveBounty) throw new Error('关联悬赏不存在')
          if (liveBounty.escrowReleased) {
            throw new Error('该悬赏托管已在处理中释放，请刷新后重试')
          }
        }

        if (clawbackUserId != null) {
          await applyCoinDelta(req, {
            userId: clawbackUserId,
            amount: -amount,
            type: 'appeal-clawback',
            note: `申诉追回：${targetLabel}`,
            relatedOrder: orderId ?? undefined,
            relatedBounty: bountyId ?? undefined,
            relatedAppeal: id,
          })
        }

        await applyCoinDelta(req, {
          userId: applicantId,
          amount,
          type: 'appeal-refund',
          note: `申诉退款：${targetLabel}`,
          relatedOrder: orderId ?? undefined,
          relatedBounty: bountyId ?? undefined,
          relatedAppeal: id,
        })

        if (bountyNeedsEscrowRelease && bountyId != null) {
          await req.payload.update({
            collection: 'bounties',
            id: bountyId,
            data: { escrowReleased: true },
            depth: 0,
            overrideAccess: true,
            req,
            context: { disableRevalidate: true },
          })
        }

        await req.payload.update({
          collection: 'appeals',
          id,
          data: {
            status: 'approved',
            settled: true,
            refundAmount: amount,
            reviewNote: note || undefined,
            reviewedBy: req.user!.id,
            reviewedAt: new Date().toISOString(),
          },
          depth: 0,
          overrideAccess: true,
          req,
          context: { disableRevalidate: true },
        })
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : '结算失败'
      if (message.includes('余额不足')) {
        return json({ error: '对方余额不足，无法追回等额平台币，请人工处理后再批准' }, 400)
      }
      return json({ error: message || '批准失败' }, 400)
    }

    await notifyUser(req, {
      userId: applicantId,
      title: '申诉已批准',
      message: note
        ? `你的申诉已批准，退还 ${amount} Coin。处理说明：${note}`
        : `你的申诉已批准，退还 ${amount} Coin。`,
      link: '/account?tab=appeals',
    })

    if (clawbackUserId != null) {
      await notifyUser(req, {
        userId: clawbackUserId,
        title: '申诉追回通知',
        message: `因申诉「${targetLabel}」获批，已从你的余额扣除 ${amount} Coin。`,
        link: '/account?tab=transactions',
      })
    }

    return json({ success: true, status: 'approved', refundAmount: amount }, 200)
  },
}
