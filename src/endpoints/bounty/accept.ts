import type { Endpoint, PayloadRequest } from 'payload'

import { applyCoinDelta } from '@/utilities/coin'
import { notifyUser } from '@/utilities/notify'
import { withTransaction } from '@/utilities/withTransaction'

type AcceptBody = { submissionId?: string | number }

const json = (data: unknown, status: number) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

const relId = (value: unknown): number | string | null => {
  if (value == null) return null
  return typeof value === 'object'
    ? (value as { id: number | string }).id
    : (value as number | string)
}

/** 采纳提交：发起人确认后原子发放悬赏给完成者，标记悬赏完成。 */
export const bountyAcceptEndpoint: Endpoint = {
  path: '/bounty/accept',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user) {
      return json({ error: '请先登录' }, 401)
    }

    let body: AcceptBody
    try {
      body = (await req.json?.()) as AcceptBody
    } catch {
      return json({ error: '请求格式无效' }, 400)
    }

    const submissionId = body?.submissionId
    if (submissionId == null) {
      return json({ error: '缺少必要参数' }, 400)
    }

    const submission = await req.payload.findByID({
      collection: 'bounty-submissions',
      id: submissionId,
      depth: 0,
      disableErrors: true,
      overrideAccess: true,
      req,
    })

    if (!submission) {
      return json({ error: '提交不存在' }, 404)
    }

    const bountyId = relId(submission.bounty)
    const bounty = await req.payload.findByID({
      collection: 'bounties',
      id: bountyId as number,
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
    if (!isAuthor && req.user.role !== 'admin') {
      return json({ error: '只有发起人可以采纳' }, 403)
    }

    if (bounty.status !== 'open' || bounty.escrowReleased) {
      return json({ error: '该悬赏已结算或不在进行中' }, 400)
    }

    const winnerId = relId(submission.submitter)
    const reward = bounty.reward ?? 0

    // 其余未采纳的提交，用于结算时置为「未采纳」并通知落选者。
    const others = await req.payload.find({
      collection: 'bounty-submissions',
      where: {
        and: [{ bounty: { equals: bounty.id } }, { id: { not_equals: submissionId } }],
      },
      limit: 200,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const loserIds = others.docs
      .map((d) => relId(d.submitter))
      .filter((v): v is number | string => v != null)

    const result = await withTransaction(req, async () => {
      await req.payload.update({
        collection: 'bounty-submissions',
        id: submissionId,
        data: { status: 'accepted' },
        depth: 0,
        overrideAccess: true,
        req,
        context: { disableRevalidate: true },
      })

      for (const other of others.docs) {
        if (other.status === 'submitted') {
          await req.payload.update({
            collection: 'bounty-submissions',
            id: other.id,
            data: { status: 'rejected' },
            depth: 0,
            overrideAccess: true,
            req,
            context: { disableRevalidate: true },
          })
        }
      }

      await req.payload.update({
        collection: 'bounties',
        id: bounty.id,
        data: {
          status: 'fulfilled',
          acceptedSubmission: submissionId as number,
          escrowReleased: true,
        },
        depth: 0,
        overrideAccess: true,
        req,
        context: { disableRevalidate: true },
      })

      let winnerBalance: number | null = null
      if (reward > 0 && winnerId != null) {
        winnerBalance = await applyCoinDelta(req, {
          userId: winnerId,
          amount: reward,
          type: 'bounty-reward',
          note: `悬赏采纳奖励：${bounty.title}`,
          relatedBounty: bounty.id,
        })
      }

      return { bountyId: bounty.id, winnerBalance }
    })

    // 结算成功后通知双方（通知失败不影响已提交的事务）。
    if (winnerId != null) {
      await notifyUser(req, {
        userId: winnerId,
        title: '你的方案已被采纳',
        message: `「${bounty.title}」采纳了你的方案，获得 ${reward} Coin`,
        link: `/bounty/${bounty.slug}`,
      })
    }
    for (const loserId of loserIds) {
      await notifyUser(req, {
        userId: loserId,
        title: '悬赏已被采纳',
        message: `「${bounty.title}」已选择其他方案，感谢你的参与`,
        link: `/bounty/${bounty.slug}`,
      })
    }

    return json(result, 200)
  },
}
