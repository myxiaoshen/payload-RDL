import type { Endpoint, PayloadRequest } from 'payload'

type DownloadBody = {
  softwareId?: string
  fileIndex?: number
}

const json = (data: unknown, status: number) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

/**
 * Resolves a download URL only for authenticated users and increments the counter.
 * Direct file URLs are never embedded in the public page payload.
 */
export const downloadEndpoint: Endpoint = {
  path: '/download',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user) {
      return json({ error: '请先登录后再下载' }, 401)
    }

    let body: DownloadBody
    try {
      body = (await req.json?.()) as DownloadBody
    } catch {
      return json({ error: '请求格式无效' }, 400)
    }

    const { softwareId, fileIndex } = body ?? {}

    if (typeof softwareId !== 'string' || !softwareId || !Number.isInteger(fileIndex)) {
      return json({ error: '缺少必要参数' }, 400)
    }

    const doc = await req.payload.findByID({
      collection: 'software',
      id: softwareId,
      depth: 1,
      disableErrors: true,
      overrideAccess: false,
      req,
    })

    if (!doc || doc._status !== 'published') {
      return json({ error: '软件不存在' }, 404)
    }

    const entry = doc.downloadFiles?.[fileIndex as number]

    if (!entry) {
      return json({ error: '下载项不存在' }, 404)
    }

    const url =
      entry.fileSource === 'url'
        ? entry.url
        : typeof entry.file === 'object' && entry.file
          ? entry.file.url
          : null

    if (!url) {
      return json({ error: '该下载项尚未配置文件' }, 404)
    }

    await req.payload.update({
      collection: 'software',
      id: softwareId,
      data: { downloadCount: (doc.downloadCount ?? 0) + 1 },
      context: { disableRevalidate: true },
      overrideAccess: true,
      req,
    })

    return json({ url, label: entry.label }, 200)
  },
}
