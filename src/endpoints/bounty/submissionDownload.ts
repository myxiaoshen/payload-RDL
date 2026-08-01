import type { Endpoint, PayloadRequest } from 'payload'

type DownloadBody = { submissionId?: string | number }

const json = (data: unknown, status: number) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

const relId = (value: unknown): number | string | null => {
  if (value == null) return null
  return typeof value === 'object'
    ? (value as { id: number | string }).id
    : (value as number | string)
}

/** 采纳方案下载：校验为发起人（且已采纳）或提交者本人/管理员后返回真实下载地址。 */
export const bountySubmissionDownloadEndpoint: Endpoint = {
  path: '/bounty/submission-download',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user) {
      return json({ error: '请先登录' }, 401)
    }

    let body: DownloadBody
    try {
      body = (await req.json?.()) as DownloadBody
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
      depth: 1,
      disableErrors: true,
      overrideAccess: true,
      req,
    })

    if (!submission) {
      return json({ error: '提交不存在' }, 404)
    }

    const submitterId = relId(submission.submitter)
    const isSubmitter = submitterId != null && String(submitterId) === String(req.user.id)
    const isAdmin = req.user.role === 'admin'

    let allowed = isSubmitter || isAdmin

    // 发起人仅在方案被采纳后可下载。
    if (!allowed && submission.status === 'accepted') {
      const bountyId = relId(submission.bounty)
      const bounty = await req.payload.findByID({
        collection: 'bounties',
        id: bountyId as number,
        depth: 0,
        disableErrors: true,
        overrideAccess: true,
        req,
      })
      const authorId = relId(bounty?.author)
      allowed = authorId != null && String(authorId) === String(req.user.id)
    }

    if (!allowed) {
      return json({ error: '无权下载该方案' }, 403)
    }

    const df = submission.downloadFile
    const url =
      df?.fileSource === 'url'
        ? df.url
        : typeof df?.file === 'object' && df?.file
          ? df.file.url
          : null

    if (!url) {
      return json({ error: '该方案尚未配置下载文件' }, 404)
    }

    return json({ url }, 200)
  },
}
