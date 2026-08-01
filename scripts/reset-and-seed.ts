/**
 * 重置并重建演示数据脚本
 *
 * 作用：
 *  1. 清空所有业务集合（保留 role=admin 的管理员账号）
 *  2. 为每个栏目重建演示数据，图片统一使用「外部 URL」（picsum.photos），无需下载文件
 *
 * 运行：
 *  pnpm reset:seed
 *  （等价于 node --import=tsx/esm -r dotenv/config scripts/reset-and-seed.ts）
 */
import type { Media, User } from '@/payload-types'
import type { CollectionSlug, Payload, RequiredDataFromCollectionSlug } from 'payload'

import { getPayload } from 'payload'
import config from '../src/payload.config'

import { about } from '../src/endpoints/seed/about'
import { featuredSoftwarePage, sevenZip } from '../src/endpoints/seed/featured-software'
import { home } from '../src/endpoints/seed/home'
import { messages } from '../src/endpoints/seed/messages'
import { post1 } from '../src/endpoints/seed/post-1'
import { post2 } from '../src/endpoints/seed/post-2'
import { post3 } from '../src/endpoints/seed/post-3'
import { series1, series2 } from '../src/endpoints/seed/series'
import { simpleRichText, software1, software2 } from '../src/endpoints/seed/software'

// 运行在 Next.js 运行时之外，Payload 的 revalidate 钩子会因缺少静态生成上下文抛错，
// 因此所有写操作都统一关闭重新验证。
const noRevalidate = { context: { disableRevalidate: true } } as const

/** 生成一张「外部 URL」演示图片记录（不上传本地文件） */
async function createExternalMedia(
  payload: Payload,
  alt: string,
  seed: string,
  width: number,
  height: number,
): Promise<Media> {
  return payload.create({
    collection: 'media',
    data: {
      alt,
      externalUrl: `https://picsum.photos/seed/${seed}/${width}/${height}`,
    },
    ...noRevalidate,
  })
}

/** 清空一个集合中的全部文档 */
async function clearCollection(payload: Payload, collection: CollectionSlug): Promise<void> {
  try {
    await payload.delete({
      collection,
      where: { id: { exists: true } },
      ...noRevalidate,
    })
    payload.logger.info(`  ✓ 已清空 ${collection}`)
  } catch (err) {
    payload.logger.warn(`  ! 清空 ${collection} 失败（可能表不存在）：${(err as Error).message}`)
  }
}

const seed = async (): Promise<void> => {
  const payload = await getPayload({ config })

  payload.logger.info('=== 开始重置数据库（保留管理员账号）===')

  // 1) 清空业务集合 -------------------------------------------------------
  const businessCollections: CollectionSlug[] = [
    'posts',
    'software',
    'series',
    'pages',
    'categories',
    'software-categories',
    'market-categories',
    'bounty-categories',
    'media',
    'messages',
    'comments',
    'favorites',
    'notifications',
    'notification-reads',
    'search',
  ]
  for (const c of businessCollections) {
    await clearCollection(payload, c)
  }

  // 删除非管理员用户（保留 role=admin）
  const admins = await payload.find({
    collection: 'users',
    where: { role: { equals: 'admin' } },
    limit: 100,
    pagination: false,
    depth: 0,
  })
  const adminIds = admins.docs.map((u) => u.id)
  if (adminIds.length > 0) {
    await payload.delete({
      collection: 'users',
      where: { id: { not_in: adminIds } },
      ...noRevalidate,
    })
    payload.logger.info(`  ✓ 已保留 ${adminIds.length} 个管理员，清除其余用户`)
  } else {
    payload.logger.warn('  ! 未找到 role=admin 的用户，跳过用户清理')
  }

  // 用第一个管理员作为演示文章作者
  const author = (admins.docs[0] as User | undefined) ?? undefined

  // 2) 重建媒体（全部外部 URL 图片）--------------------------------------
  payload.logger.info('=== 重建演示媒体（外部 URL 图片）===')
  const imgHome = await createExternalMedia(payload, '首页横幅', 'homehero', 1600, 700)
  const imgPost1Hero = await createExternalMedia(payload, '文章封面 1', 'posthero1', 1200, 675)
  const imgPost1Block = await createExternalMedia(payload, '文章插图 1', 'postblock1', 1200, 675)
  const imgPost2Hero = await createExternalMedia(payload, '文章封面 2', 'posthero2', 1200, 675)
  const imgPost2Block = await createExternalMedia(payload, '文章插图 2', 'postblock2', 1200, 675)
  const imgPost3Hero = await createExternalMedia(payload, '文章封面 3', 'posthero3', 1200, 675)
  const imgPost3Block = await createExternalMedia(payload, '文章插图 3', 'postblock3', 1200, 675)
  const iconSoft1 = await createExternalMedia(payload, '极速下载器图标', 'softturbo', 512, 512)
  const iconSoft2 = await createExternalMedia(payload, '像素图像编辑器图标', 'softpixel', 512, 512)
  const iconSoft3 = await createExternalMedia(payload, '系统清理大师图标', 'softcleaner', 512, 512)
  const iconSoft4 = await createExternalMedia(payload, '云端笔记图标', 'softnotes', 512, 512)
  const shot1 = await createExternalMedia(payload, '软件截图 1', 'shot1', 1280, 800)
  const shot2 = await createExternalMedia(payload, '软件截图 2', 'shot2', 1280, 800)
  const shot3 = await createExternalMedia(payload, '软件截图 3', 'shot3', 1280, 800)
  const shot4 = await createExternalMedia(payload, '软件截图 4', 'shot4', 1280, 800)
  const coverSeries1 = await createExternalMedia(payload, '专题封面 1', 'series1', 1200, 800)
  const coverSeries2 = await createExternalMedia(payload, '专题封面 2', 'series2', 1200, 800)

  // 3) 分类 --------------------------------------------------------------
  payload.logger.info('=== 重建分类 ===')
  const postCatDefs: { title: string; slug: string }[] = [
    { title: '技术资讯', slug: 'tech-news' },
    { title: '教程指南', slug: 'tutorials' },
    { title: '设计灵感', slug: 'design' },
  ]
  const softwareCatDefs: { title: string; slug: string }[] = [
    { title: '软件工具', slug: 'software-tools' },
    { title: '效率办公', slug: 'office' },
    { title: '开发框架', slug: 'dev-frameworks' },
    { title: '设计素材', slug: 'design-assets' },
  ]
  const marketCatDefs: { title: string; slug: string }[] = [
    { title: '源码工程', slug: 'source-code' },
    { title: '设计素材', slug: 'design-material' },
    { title: '学习资料', slug: 'learning' },
  ]

  const cats: Record<string, number> = {}
  for (const def of postCatDefs) {
    const doc = await payload.create({ collection: 'categories', data: def, ...noRevalidate })
    cats[def.slug] = doc.id as number
  }

  const softCats: Record<string, number> = {}
  for (const def of softwareCatDefs) {
    const doc = await payload.create({
      collection: 'software-categories',
      data: def,
      ...noRevalidate,
    })
    softCats[def.slug] = doc.id as number
  }

  for (const def of marketCatDefs) {
    await payload.create({ collection: 'market-categories', data: def, ...noRevalidate })
  }

  const bountyCatDefs: { title: string; slug: string }[] = [
    { title: '求资源', slug: 'ask-resource' },
    { title: '求教程', slug: 'ask-tutorial' },
    { title: '求软件使用方案', slug: 'ask-solution' },
    { title: '求设计模板', slug: 'ask-template' },
  ]
  for (const def of bountyCatDefs) {
    await payload.create({ collection: 'bounty-categories', data: def, ...noRevalidate })
  }

  // 4) 文章 --------------------------------------------------------------
  payload.logger.info('=== 重建文章 ===')
  const demoAuthor =
    author ??
    (await payload.create({
      collection: 'users',
      data: { name: '演示作者', email: 'demo-author@example.com', password: 'password' },
      ...noRevalidate,
    }))

  const p1 = await payload.create({
    collection: 'posts',
    data: post1({ heroImage: imgPost1Hero, blockImage: imgPost1Block, author: demoAuthor }),
    ...noRevalidate,
  })
  const p2 = await payload.create({
    collection: 'posts',
    data: post2({ heroImage: imgPost2Hero, blockImage: imgPost2Block, author: demoAuthor }),
    ...noRevalidate,
  })
  const p3 = await payload.create({
    collection: 'posts',
    data: post3({ heroImage: imgPost3Hero, blockImage: imgPost3Block, author: demoAuthor }),
    ...noRevalidate,
  })
  await payload.update({
    collection: 'posts',
    id: p1.id,
    data: { relatedPosts: [p2.id, p3.id], categories: [cats['tech-news'], cats['tutorials']] },
    ...noRevalidate,
  })
  await payload.update({
    collection: 'posts',
    id: p2.id,
    data: { relatedPosts: [p1.id], categories: [cats['tech-news']] },
    ...noRevalidate,
  })
  await payload.update({
    collection: 'posts',
    id: p3.id,
    data: { relatedPosts: [p1.id, p2.id], categories: [cats['design']] },
    ...noRevalidate,
  })

  // 5) 软件 --------------------------------------------------------------
  payload.logger.info('=== 重建软件 ===')
  await payload.create({
    collection: 'software',
    data: {
      ...software1({ thumbnail: iconSoft1, categoryIds: [softCats['software-tools']] }),
      screenshots: [{ image: shot1.id }, { image: shot2.id }],
    },
    ...noRevalidate,
  })
  await payload.create({
    collection: 'software',
    data: {
      ...software2({
        thumbnail: iconSoft2,
        categoryIds: [softCats['software-tools'], softCats['design-assets']],
      }),
      screenshots: [{ image: shot3.id }, { image: shot4.id }],
    },
    ...noRevalidate,
  })
  await payload.create({
    collection: 'software',
    data: {
      title: '系统清理大师',
      slug: 'system-cleaner',
      _status: 'published',
      thumbnail: iconSoft3.id,
      summary: '一键清理系统垃圾、优化启动项，让老电脑重获新生。',
      description: simpleRichText([
        '系统清理大师能够深度扫描并清理临时文件、缓存与冗余注册表项。',
        '内置启动项管理与内存优化，帮助你的设备保持流畅运行。',
      ]),
      version: '3.0.1',
      platform: ['windows'],
      categories: [softCats['office']],
      featured: true,
      screenshots: [{ image: shot1.id }],
      downloadFiles: [
        {
          label: 'v3.0.1 Windows 安装包',
          platform: 'windows',
          fileSize: '18.2 MB',
          requiredRole: 'user',
          fileSource: 'url',
          url: 'https://example.com/download/system-cleaner-win.exe',
        },
      ],
    } as RequiredDataFromCollectionSlug<'software'>,
    ...noRevalidate,
  })
  await payload.create({
    collection: 'software',
    data: {
      title: '云端笔记',
      slug: 'cloud-notes',
      _status: 'published',
      thumbnail: iconSoft4.id,
      summary: '跨平台云同步笔记应用，支持 Markdown 与实时协作。',
      description: simpleRichText([
        '云端笔记支持 Markdown 编写、多端实时同步与团队协作。',
        '端到端加密保障隐私，随时随地记录你的灵感。',
      ]),
      version: '1.8.0',
      platform: ['windows', 'macos', 'linux', 'web'],
      categories: [softCats['office'], softCats['dev-frameworks']],
      featured: false,
      screenshots: [{ image: shot2.id }, { image: shot3.id }],
      downloadFiles: [
        {
          label: 'v1.8.0 桌面版',
          platform: 'windows',
          fileSize: '45.7 MB',
          requiredRole: 'user',
          fileSource: 'url',
          url: 'https://example.com/download/cloud-notes.zip',
        },
        {
          label: 'v1.8.0 VIP 高级版',
          platform: 'macos',
          fileSize: '48.1 MB',
          requiredRole: 'vip',
          fileSource: 'url',
          url: 'https://example.com/download/cloud-notes-pro.dmg',
        },
      ],
    } as RequiredDataFromCollectionSlug<'software'>,
    ...noRevalidate,
  })
  await payload.create({
    collection: 'software',
    data: sevenZip({ thumbnail: iconSoft1, categoryIds: [softCats['software-tools']] }),
    ...noRevalidate,
  })

  // 6) 专题 --------------------------------------------------------------
  payload.logger.info('=== 重建专题 ===')
  await payload.create({
    collection: 'series',
    data: series1({ cover: coverSeries1, postIds: [p1.id, p2.id, p3.id] }),
    ...noRevalidate,
  })
  await payload.create({
    collection: 'series',
    data: series2({ cover: coverSeries2, postIds: [p3.id] }),
    ...noRevalidate,
  })

  // 7) 页面 --------------------------------------------------------------
  payload.logger.info('=== 重建页面 ===')
  await payload.create({
    collection: 'pages',
    data: home({ heroImage: imgHome, metaImage: imgPost1Hero }),
    ...noRevalidate,
  })
  await payload.create({ collection: 'pages', data: about, ...noRevalidate })
  await payload.create({ collection: 'pages', data: featuredSoftwarePage, ...noRevalidate })

  // 8) 留言 --------------------------------------------------------------
  payload.logger.info('=== 重建留言 ===')
  for (const m of messages) {
    await payload.create({ collection: 'messages', data: m, ...noRevalidate })
  }

  // 9) 页眉 / 页脚导航 ---------------------------------------------------
  payload.logger.info('=== 设置页眉/页脚导航 ===')
  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        { link: { type: 'custom', label: '软件', url: '/software' } },
        { link: { type: 'custom', label: '文章', url: '/posts' } },
        { link: { type: 'custom', label: '专题', url: '/topics' } },
        { link: { type: 'custom', label: '联系我们', url: '/contact' } },
      ],
    },
    ...noRevalidate,
  })
  await payload.updateGlobal({
    slug: 'footer',
    data: {
      navItems: [
        { link: { type: 'custom', label: '后台管理', url: '/admin' } },
        { link: { type: 'custom', label: '联系我们', url: '/contact' } },
      ],
    },
    ...noRevalidate,
  })

  payload.logger.info('=== 重置并重建演示数据完成 ===')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
