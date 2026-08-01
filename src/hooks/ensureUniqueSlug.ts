import type { CollectionSlug, PayloadRequest } from 'payload'

import { generateRandomSlug } from '@/utilities/generateRandomSlug'

type Args = {
  collection: CollectionSlug
  currentId?: number | string
  req: PayloadRequest
}

/**
 * 生成不与库内已有记录冲突的 slug。
 * 通过 REST/前台表单创建时不依赖标题联动，统一在服务端补齐随机 slug。
 */
export const ensureUniqueSlug = async ({ collection, currentId, req }: Args): Promise<string> => {
  const base = generateRandomSlug()

  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`

    const existing = await req.payload.find({
      collection,
      where: { slug: { equals: candidate } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })

    const taken = existing.docs.some((doc) => String(doc.id) !== String(currentId))
    if (!taken) return candidate
  }

  return `${base}-${Date.now().toString(36)}`
}
