import type { Endpoint, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'

import { markdownToLexical } from '@/utilities/markdownToLexical'
import { notifyUser } from '@/utilities/notify'

type SubmitBody = {
  bountyId?: string | number
  content?: string
  url?: string
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

/** 提交悬赏方案：校验悬赏进行中、非本人、未重复提交后创建提交并累加计数。 */
export const bountySubmitEndpoint: Endpoint = {
  path: '/bounty/submit',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user) {
      return json({ error: '请先登录' }, 401)
    }

    let body: SubmitBody
    try {
      body = (await req.json?.()) as SubmitBody
    } catch {
      return json({ error: '请求格式无效' }, 400)
    }

    const bountyId = body?.bountyId
    if (bountyId == null) {
      return json({ error: '缺少必要参数' }, 400)
    }

    const url = String(body?.url ?? '').trim()
    if (!url) {
      return json({ error: '请填写下载地址' }, 400)
    }

    const bounty = await req.payload.findByID({
      collection: 'bounties',
      id: bountyId,
      depth: 0,
      disableErrors: true,
      overrideAccess: true,
      req,
    })

    if (!bounty || bounty.status !== 'open') {
      return json({ error: '悬赏不存在或不在进行中' }, 404)
    }

    const authorId = relId(bounty.author)
    if (authorId != null && String(authorId) === String(req.user.id)) {
      return json({ error: '不能对自己发布的悬赏提交方案' }, 400)
    }

    const existing = await req.payload.find({
      collection: 'bounty-submissions',
      where: {
        and: [{ bounty: { equals: bountyId } }, { submitter: { equals: req.user.id } }],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })

    if (existing.docs.length > 0) {
      return json({ error: '你已提交过该悬赏', alreadySubmitted: true }, 400)
    }

    const content = await markdownToLexical(req, body.content)

    const submission = await req.payload.create({
      collection: 'bounty-submissions',
      data: ((): RequiredDataFromCollectionSlug<'bounty-submissions'> => {
        const d: RequiredDataFromCollectionSlug<'bounty-submissions'> = {
          bounty: bountyId as number,
          submitter: req.user!.id,
          status: 'submitted',
          downloadFile: { fileSource: 'url', url },
        }
        if (body.note) d.note = String(body.note).trim()
        if (content)
          d.content = content as RequiredDataFromCollectionSlug<'bounty-submissions'>['content']
        return d
      })(),
      depth: 0,
      overrideAccess: true,
      req,
      context: { disableRevalidate: true },
    })

    await req.payload.update({
      collection: 'bounties',
      id: bountyId,
      data: { submissionCount: (bounty.submissionCount ?? 0) + 1 },
      depth: 0,
      overrideAccess: true,
      req,
      context: { disableRevalidate: true },
    })

    if (authorId != null) {
      await notifyUser(req, {
        userId: authorId,
        title: '悬赏收到新方案',
        message: `「${bounty.title}」收到一个新方案，快去查看吧`,
        link: `/bounty/${bounty.slug}`,
      })
    }

    return json({ submissionId: submission.id }, 200)
  },
}
