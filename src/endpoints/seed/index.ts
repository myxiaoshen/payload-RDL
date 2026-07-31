import type {
  CollectionSlug,
  Payload,
  PayloadRequest,
  File,
  DataFromCollectionSlug,
  RequiredDataFromCollectionSlug,
} from 'payload'

import type { Media } from '@/payload-types'

import { about } from './about'
import { home } from './home'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'
import { messages } from './messages'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { series1, series2 } from './series'
import { software1, software2 } from './software'

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database (additive — existing content is preserved)...')

  payload.logger.info(`— Seeding media...`)

  const baseUrl =
    'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/website/src/endpoints/seed'

  const image1Doc = await ensureMedia(
    payload,
    req,
    'image-post1.webp',
    `${baseUrl}/image-post1.webp`,
    image1,
  )
  const image2Doc = await ensureMedia(
    payload,
    req,
    'image-post2.webp',
    `${baseUrl}/image-post2.webp`,
    image2,
  )
  const image3Doc = await ensureMedia(
    payload,
    req,
    'image-post3.webp',
    `${baseUrl}/image-post3.webp`,
    image2,
  )
  const imageHomeDoc = await ensureMedia(
    payload,
    req,
    'image-hero1.webp',
    `${baseUrl}/image-hero1.webp`,
    imageHero1,
  )

  payload.logger.info(`— Seeding demo author...`)

  const authorResult = await payload.find({
    collection: 'users',
    where: { email: { equals: 'demo-author@example.com' } },
    limit: 1,
    pagination: false,
    depth: 0,
    req,
  })
  const demoAuthor =
    authorResult.docs[0] ??
    (await payload.create({
      collection: 'users',
      data: {
        name: 'Demo Author',
        email: 'demo-author@example.com',
        password: 'password',
      },
      req,
    }))

  payload.logger.info(`— Seeding categories...`)

  const categoryTools = await ensureBySlug(payload, req, 'software-categories', 'software-tools', {
    title: '软件工具',
    slug: 'software-tools',
  })
  const categoryNews = await ensureBySlug(payload, req, 'categories', 'tech-news', {
    title: '技术资讯',
    slug: 'tech-news',
  })

  payload.logger.info(`— Seeding posts...`)

  const existingPost1 = await findBySlug(payload, req, 'posts', 'digital-horizons')
  const post1Doc =
    existingPost1 ??
    (await payload.create({
      collection: 'posts',
      depth: 0,
      req,
      context: { disableRevalidate: true },
      data: post1({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
    }))

  const existingPost2 = await findBySlug(payload, req, 'posts', 'global-gaze')
  const post2Doc =
    existingPost2 ??
    (await payload.create({
      collection: 'posts',
      depth: 0,
      req,
      context: { disableRevalidate: true },
      data: post2({ heroImage: image2Doc, blockImage: image3Doc, author: demoAuthor }),
    }))

  // 仅为新创建的示例文章补充关联与分类，避免覆盖已存在文章
  if (!existingPost1) {
    await payload.update({
      id: post1Doc.id,
      collection: 'posts',
      req,
      data: { relatedPosts: [post2Doc.id], categories: [categoryNews.id] },
    })
  }
  if (!existingPost2) {
    await payload.update({
      id: post2Doc.id,
      collection: 'posts',
      req,
      data: { relatedPosts: [post1Doc.id], categories: [categoryNews.id] },
    })
  }

  payload.logger.info(`— Seeding software...`)

  await ensureBySlug(
    payload,
    req,
    'software',
    'turbo-downloader',
    software1({ thumbnail: image1Doc, categoryIds: [categoryTools.id] }),
  )
  await ensureBySlug(
    payload,
    req,
    'software',
    'pixel-image-editor',
    software2({ thumbnail: image2Doc, categoryIds: [categoryTools.id] }),
  )

  payload.logger.info(`— Seeding series...`)

  await ensureBySlug(
    payload,
    req,
    'series',
    'tech-frontier',
    series1({ cover: image1Doc, postIds: [post1Doc.id, post2Doc.id] }),
  )
  await ensureBySlug(
    payload,
    req,
    'series',
    'design-and-creation',
    series2({ cover: image2Doc, postIds: [post2Doc.id] }),
  )

  payload.logger.info(`— Seeding pages...`)

  await ensureBySlug(
    payload,
    req,
    'pages',
    'home',
    home({ heroImage: imageHomeDoc, metaImage: image2Doc }),
  )
  await ensureBySlug(payload, req, 'pages', 'about', about)

  payload.logger.info(`— Seeding sample messages...`)

  // 仅在没有任何留言时补充示例，避免覆盖真实用户留言
  const messageCount = await payload.count({ collection: 'messages', req })
  if (messageCount.totalDocs === 0) {
    for (const message of messages) {
      await payload.create({ collection: 'messages', data: message, req })
    }
  }

  payload.logger.info(`— Seeding globals (only when empty)...`)

  // 仅在导航为空时填充，不覆盖用户已配置的页眉/页脚
  const header = await payload.findGlobal({ slug: 'header', depth: 0, req })
  if (!header.navItems || header.navItems.length === 0) {
    await payload.updateGlobal({
      slug: 'header',
      req,
      data: {
        navItems: [
          { link: { type: 'custom', label: '软件', url: '/software' } },
          { link: { type: 'custom', label: '文章', url: '/posts' } },
          { link: { type: 'custom', label: '专题', url: '/topics' } },
          { link: { type: 'custom', label: '联系我们', url: '/contact' } },
        ],
      },
    })
  }

  const footer = await payload.findGlobal({ slug: 'footer', depth: 0, req })
  if (!footer.navItems || footer.navItems.length === 0) {
    await payload.updateGlobal({
      slug: 'footer',
      req,
      data: {
        navItems: [
          { link: { type: 'custom', label: '后台管理', url: '/admin' } },
          { link: { type: 'custom', label: '联系我们', url: '/contact' } },
        ],
      },
    })
  }

  payload.logger.info('Seeded database successfully!')
}

/** 按 slug 查找集合中已存在的文档，不存在返回 undefined */
async function findBySlug<T extends CollectionSlug>(
  payload: Payload,
  req: PayloadRequest,
  collection: T,
  slug: string,
): Promise<DataFromCollectionSlug<T> | undefined> {
  const res = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    pagination: false,
    depth: 0,
    req,
  })
  return res.docs[0]
}

/** 存在则复用，不存在则创建（幂等） */
async function ensureBySlug<T extends CollectionSlug>(
  payload: Payload,
  req: PayloadRequest,
  collection: T,
  slug: string,
  data: RequiredDataFromCollectionSlug<T>,
): Promise<DataFromCollectionSlug<T>> {
  const existing = await findBySlug(payload, req, collection, slug)
  if (existing) return existing
  return payload.create({
    collection,
    data,
    depth: 0,
    req,
    context: { disableRevalidate: true },
  })
}

/** 按文件名查找媒体，不存在则下载并创建（幂等） */
async function ensureMedia(
  payload: Payload,
  req: PayloadRequest,
  filename: string,
  url: string,
  data: RequiredDataFromCollectionSlug<'media'>,
): Promise<Media> {
  const res = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    pagination: false,
    depth: 0,
    req,
  })
  if (res.docs[0]) return res.docs[0]
  const file = await fetchFileByURL(url)
  return payload.create({ collection: 'media', data, file, req })
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}
