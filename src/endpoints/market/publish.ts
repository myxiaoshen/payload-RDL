import type { Endpoint, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'

import { markdownToLexical } from '@/utilities/markdownToLexical'

type PublishBody = {
  title?: string
  summary?: string
  price?: number | string
  category?: string | number
  coverImage?: string | number
  url?: string
  description?: string
}

const json = (data: unknown, status: number) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

// 前端表单以字符串传关系 id，Postgres 需数字；纯数字串转 number，其余（如 mongo id）原样。
const toId = (value: string | number): number | string => {
  const s = String(value)
  return /^\d+$/.test(s) ? Number(s) : s
}

/** 发布交易资源：转换 Markdown 详情后创建资源（作者/状态/slug 由集合钩子补齐）。 */
export const marketPublishEndpoint: Endpoint = {
  path: '/market/publish',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user) {
      return json({ error: '请先登录' }, 401)
    }

    let body: PublishBody
    try {
      body = (await req.json?.()) as PublishBody
    } catch {
      return json({ error: '请求格式无效' }, 400)
    }

    const title = String(body?.title ?? '').trim()
    const summary = String(body?.summary ?? '').trim()
    const url = String(body?.url ?? '').trim()
    const price = Math.max(0, Math.floor(Number(body?.price ?? 0)))

    if (!title || !summary) {
      return json({ error: '请填写名称与简介' }, 400)
    }
    if (!url) {
      return json({ error: '请填写下载文件地址' }, 400)
    }

    const description = await markdownToLexical(req, body.description)

    type ResourceCreate = RequiredDataFromCollectionSlug<'market-resources'>
    const data: Omit<ResourceCreate, 'slug'> & Partial<Pick<ResourceCreate, 'slug'>> = {
      title,
      summary,
      price,
      downloadFile: { fileSource: 'url', url },
    }
    if (body.category) data.category = toId(body.category) as number
    if (body.coverImage) data.coverImage = toId(body.coverImage) as number
    if (description) data.description = description as ResourceCreate['description']

    const resource = await req.payload.create({
      collection: 'market-resources',
      data: data as ResourceCreate,
      depth: 0,
      overrideAccess: true,
      req,
      context: { disableRevalidate: true },
    })

    return json({ resourceId: resource.id, slug: resource.slug }, 200)
  },
}
