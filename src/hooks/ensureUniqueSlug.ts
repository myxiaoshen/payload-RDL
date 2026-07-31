import type { CollectionSlug, PayloadRequest } from 'payload'

import { slugify } from '@/utilities/slugify'

type Args = {
  collection: CollectionSlug
  currentId?: number | string
  req: PayloadRequest
  source: string
}

/**
 * 生成不与库内已有记录冲突的 slug。
 * 通过 REST/前台表单创建时没有后台的客户端 slug 生成，必须在 beforeValidate 阶段补齐。
 */
export const ensureUniqueSlug = async ({
  collection,
  currentId,
  req,
  source,
}: Args): Promise<string> => {
  const base = slugify(source) || `item-${Date.now().toString(36)}`

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
