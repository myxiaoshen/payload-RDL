/**
 * 为已有的 posts / software 回填搜索索引。
 * plugin-search 仅在文档保存时同步，历史数据需要手动触发一次。
 * 直接 upsert 到 `search` 集合，避免因旧数据(损坏媒体)导致源文档校验失败。
 * 运行：$env:DOTENV_CONFIG_PATH='.env'; node --import=tsx/esm -r dotenv/config scripts/reindex-search.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

type AnyDoc = {
  id: number | string
  title?: string | null
  slug?: string | null
  summary?: string | null
  meta?: { title?: string | null; description?: string | null } | null
}

const run = async () => {
  const payload = await getPayload({ config })
  const collections = ['posts', 'software'] as const

  for (const relationTo of collections) {
    const { docs } = await payload.find({
      collection: relationTo,
      depth: 0,
      limit: 1000,
      pagination: false,
      overrideAccess: true,
    })

    let ok = 0
    for (const raw of docs) {
      const doc = raw as AnyDoc
      const value = Number(doc.id)
      const docRef =
        relationTo === 'posts'
          ? { relationTo: 'posts' as const, value }
          : { relationTo: 'software' as const, value }
      const searchData = {
        title: doc.title ?? '',
        doc: docRef,
        slug: doc.slug ?? null,
        meta: {
          title: doc.meta?.title ?? doc.title ?? '',
          description: doc.meta?.description ?? doc.summary ?? '',
        },
        categories: [],
      }

      try {
        const existing = await payload.find({
          collection: 'search',
          where: {
            and: [
              { 'doc.relationTo': { equals: relationTo } },
              { 'doc.value': { equals: doc.id } },
            ],
          },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })

        if (existing.docs.length > 0) {
          await payload.update({
            collection: 'search',
            id: existing.docs[0].id,
            data: searchData,
            overrideAccess: true,
            context: { disableRevalidate: true },
          })
        } else {
          await payload.create({
            collection: 'search',
            data: searchData,
            overrideAccess: true,
            context: { disableRevalidate: true },
          })
        }
        ok++
      } catch (err) {
        console.error(`[${relationTo}] #${doc.id} 失败:`, (err as Error).message)
      }
    }
    console.log(`[${relationTo}] 索引 ${ok}/${docs.length}`)
  }

  console.log('搜索索引回填完成')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
