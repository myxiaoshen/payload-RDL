import type { CollectionSlug } from 'payload'

import { readFileSync } from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

type Snapshot = {
  softwareRels: { parent_id: number; categories_id: number; order: number; path: string }[]
  categories: { id: number; title: string; slug: string }[]
  marketResources: { id: number; title: string; category_id: number }[]
}

const noRevalidate = { context: { disableRevalidate: true } } as const

/**
 * 一次性迁移：把原先共用 `categories` 的软件/商品关联，搬到拆分后的
 * `software-categories` 与 `market-categories`。
 * 依赖拆分前用 scripts/_tmp-snapshot-categories.ts 导出的快照。
 */
const run = async () => {
  const snapshotPath = path.resolve(process.cwd(), 'scripts/category-snapshot.json')
  const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8')) as Snapshot

  const payload = await getPayload({ config })
  const categoryById = new Map(snapshot.categories.map((c) => [c.id, c]))

  const ensureCategory = async (
    collection: CollectionSlug,
    source: { title: string; slug: string },
  ): Promise<number> => {
    const existing = await payload.find({
      collection,
      where: { slug: { equals: source.slug } },
      limit: 1,
      depth: 0,
    })

    if (existing.docs[0]) return existing.docs[0].id as number

    const created = await payload.create({
      collection,
      data: { title: source.title, slug: source.slug },
      depth: 0,
      ...noRevalidate,
    })

    return created.id as number
  }

  // 软件分类
  const softwareByParent = new Map<number, number[]>()
  for (const rel of snapshot.softwareRels) {
    const source = categoryById.get(rel.categories_id)
    if (!source) continue

    const newId = await ensureCategory('software-categories', source)
    const list = softwareByParent.get(rel.parent_id) ?? []
    if (!list.includes(newId)) list.push(newId)
    softwareByParent.set(rel.parent_id, list)
  }

  for (const [softwareId, categoryIds] of softwareByParent) {
    await payload.update({
      collection: 'software',
      id: softwareId,
      data: { categories: categoryIds },
      depth: 0,
      ...noRevalidate,
    })
    payload.logger.info(`软件 #${softwareId} → 分类 ${categoryIds.join(', ')}`)
  }

  // 商品分类
  for (const resource of snapshot.marketResources) {
    const source = categoryById.get(resource.category_id)
    if (!source) continue

    const newId = await ensureCategory('market-categories', source)
    await payload.update({
      collection: 'market-resources',
      id: resource.id,
      data: { category: newId },
      depth: 0,
      ...noRevalidate,
    })
    payload.logger.info(`商品 #${resource.id} → 分类 ${newId}`)
  }

  payload.logger.info('分类拆分迁移完成')
  process.exit(0)
}

void run()
