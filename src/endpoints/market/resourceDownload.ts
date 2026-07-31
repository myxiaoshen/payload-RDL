import type { Endpoint, PayloadRequest } from 'payload'

type DownloadBody = { resourceId?: string | number }

const json = (data: unknown, status: number) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

const relId = (value: unknown): number | string | null => {
  if (value == null) return null
  return typeof value === 'object'
    ? (value as { id: number | string }).id
    : (value as number | string)
}

/** 已购资源下载：校验存在有效订单（或本人/管理员）后返回真实下载地址。 */
export const resourceDownloadEndpoint: Endpoint = {
  path: '/market/resource-download',
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

    const resourceId = body?.resourceId
    if (resourceId == null) {
      return json({ error: '缺少必要参数' }, 400)
    }

    const resource = await req.payload.findByID({
      collection: 'market-resources',
      id: resourceId,
      depth: 1,
      disableErrors: true,
      overrideAccess: true,
      req,
    })

    if (!resource || resource.status !== 'approved') {
      return json({ error: '资源不存在或未上架' }, 404)
    }

    const sellerId = relId(resource.author)
    const isOwnerOrAdmin =
      req.user.role === 'admin' || (sellerId != null && String(sellerId) === String(req.user.id))

    if (!isOwnerOrAdmin) {
      const order = await req.payload.find({
        collection: 'orders',
        where: {
          and: [{ buyer: { equals: req.user.id } }, { resource: { equals: resourceId } }],
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req,
      })

      if (order.docs.length === 0) {
        return json({ error: '请先购买该资源' }, 403)
      }
    }

    const df = resource.downloadFile
    const url =
      df?.fileSource === 'url'
        ? df.url
        : typeof df?.file === 'object' && df?.file
          ? df.file.url
          : null

    if (!url) {
      return json({ error: '该资源尚未配置下载文件' }, 404)
    }

    return json({ url }, 200)
  },
}
