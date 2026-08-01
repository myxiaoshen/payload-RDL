/**
 * 仅填充「页面」栏目的演示内容（关于我们 / 精品软件），不会删除任何已有数据。
 *
 * 运行：
 *  pnpm seed:pages
 *
 * 已存在同 slug 的页面时默认跳过；加 --force 则覆盖更新。
 */
import type { CollectionSlug, Payload, RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'

import { getPayload } from 'payload'
import config from '../src/payload.config'

import { about } from '../src/endpoints/seed/about'
import { featuredSoftwarePage, sevenZip } from '../src/endpoints/seed/featured-software'

const noRevalidate = { context: { disableRevalidate: true } } as const
const force = process.argv.includes('--force')

/** 按 slug 创建；已存在时按 --force 决定跳过还是覆盖 */
async function upsertBySlug<T extends CollectionSlug>(
  payload: Payload,
  collection: T,
  slug: string,
  data: RequiredDataFromCollectionSlug<T>,
): Promise<number> {
  const existing = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const doc = existing.docs[0] as { id: number } | undefined

  if (doc) {
    if (!force) {
      payload.logger.info(`  · ${collection}/${slug} 已存在，跳过（加 --force 可覆盖）`)
      return doc.id
    }
    // 泛型 T 下 payload.update 的 data 无法被推断为 DeepPartial，脚本内直接放行
    await payload.update({ collection, id: doc.id, data, ...noRevalidate } as unknown as Parameters<
      typeof payload.update
    >[0])
    payload.logger.info(`  ✓ 已更新 ${collection}/${slug}`)
    return doc.id
  }

  const created = await payload.create({ collection, data, ...noRevalidate })
  payload.logger.info(`  ✓ 已创建 ${collection}/${slug}`)
  return created.id as number
}

const run = async (): Promise<void> => {
  const payload = await getPayload({ config })

  payload.logger.info('=== 填充页面演示内容 ===')

  // 「精品软件」页里重点推荐的软件条目，先确保它存在
  const softwareCategory = await payload
    .find({
      collection: 'software-categories',
      where: { slug: { equals: 'software-tools' } },
      limit: 1,
      pagination: false,
      depth: 0,
    })
    .then((res) => res.docs[0])

  const categoryId =
    (softwareCategory?.id as number | undefined) ??
    ((
      await payload.create({
        collection: 'software-categories',
        data: { title: '软件工具', slug: 'software-tools' },
        ...noRevalidate,
      })
    ).id as number)

  const icon = await payload
    .find({
      collection: 'media',
      where: { alt: { equals: '7-Zip 图标' } },
      limit: 1,
      pagination: false,
      depth: 0,
    })
    .then((res) => res.docs[0] as Media | undefined)

  const thumbnail =
    icon ??
    ((await payload.create({
      collection: 'media',
      data: {
        alt: '7-Zip 图标',
        externalUrl: 'https://picsum.photos/seed/sevenzip/512/512',
      },
      ...noRevalidate,
    })) as Media)

  await upsertBySlug(
    payload,
    'software',
    '7-zip',
    sevenZip({ thumbnail, categoryIds: [categoryId] }),
  )

  await upsertBySlug(payload, 'pages', 'about', about)
  await upsertBySlug(payload, 'pages', 'featured-software', featuredSoftwarePage)

  payload.logger.info('=== 完成：/about 与 /featured-software 已可访问 ===')
  process.exit(0)
}

await run()
