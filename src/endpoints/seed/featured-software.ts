import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'

import { h, p, richText, ul } from './rich-text'

/**
 * 「精品软件」展示页：
 * 上半部分是可自动更新的精品软件卡片墙，下半部分是一款真实软件（7-Zip）的编辑部推荐。
 */
export const featuredSoftwarePage: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'featured-software',
  _status: 'published',
  title: '精品软件',
  hero: {
    type: 'lowImpact',
    richText: richText([
      h('h1', '精品软件'),
      p(
        '每一款都被我们真正装上机器用过一段时间，确认干净、稳定、值得放进日常工作流之后才会出现在这里。',
      ),
    ]),
  },
  layout: [
    {
      blockName: '精品软件卡片墙',
      blockType: 'featuredSoftware',
      introContent: richText([
        h('h2', '编辑精选'),
        p('以下软件在后台被标记为「精品推荐」，列表会随软件库更新自动同步。'),
      ]),
      populateBy: 'collection',
      onlyFeatured: true,
      limit: 6,
      showMoreLink: true,
    },
    {
      blockName: '本期重点推荐',
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: richText([
            h('h2', '本期重点推荐：7-Zip'),
            p(
              '7-Zip 是一款免费且开源的文件归档工具，由 Igor Pavlov 开发并维护了二十多年。它自带的 7z 格式压缩率通常明显优于传统 ZIP，同时能解压 RAR、ISO、CAB、DMG 等几十种格式，基本可以取代同类收费软件。',
            ),
          ]),
        },
        {
          size: 'half',
          richText: richText([
            h('h3', '为什么推荐它'),
            ul([
              '完全免费，GNU LGPL 协议开源，安装包不含任何捆绑软件。',
              '7z 格式采用 LZMA/LZMA2 算法，压缩率高、内存占用可控。',
              '支持 AES-256 加密压缩包，可同时加密文件名。',
              '深度集成资源管理器右键菜单，也提供命令行版本 7z.exe，方便写脚本。',
            ]),
          ]),
        },
        {
          size: 'half',
          richText: richText([
            h('h3', '适合谁'),
            p(
              '需要经常收发压缩包的所有人：开发者用它做发布包，设计师用它打包素材，普通用户用它解压从网上下载的各种奇怪格式。体积不到 2 MB，装完就能忘记它的存在，需要时右键即可。',
            ),
            p(
              '官方站点：https://www.7-zip.org/ — 请始终从官网或本站收录的镜像下载，避免第三方站点的捆绑版本。',
            ),
          ]),
          enableLink: true,
          link: {
            type: 'custom',
            url: '/software/7-zip',
            label: '查看 7-Zip 详情',
            appearance: 'default',
          },
        },
      ],
    },
    {
      blockName: '收录标准',
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: richText([h('h2', '我们如何挑选')]),
        },
        {
          size: 'oneThird',
          richText: richText([
            h('h3', '来源可查'),
            p('优先收录开源项目或有明确官网的软件，安装包必须能追溯到官方发布渠道。'),
          ]),
        },
        {
          size: 'oneThird',
          richText: richText([
            h('h3', '长期维护'),
            p('停更超过两年、且没有社区接手的项目不会进入精品列表。'),
          ]),
        },
        {
          size: 'oneThird',
          richText: richText([
            h('h3', '真的好用'),
            p('至少有一位编辑把它当作主力工具使用过一个月以上，能说清楚它好在哪、差在哪。'),
          ]),
        },
      ],
    },
    {
      blockName: '推荐入口',
      blockType: 'cta',
      richText: richText([
        h('h2', '有你心中的神器还没上榜？'),
        p('把名字和推荐理由发给我们，通过评估后就会出现在这个页面上。'),
      ]),
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: '推荐一款软件',
            url: '/contact',
          },
        },
        {
          link: {
            type: 'custom',
            appearance: 'outline',
            label: '浏览完整软件库',
            url: '/software',
          },
        },
      ],
    },
  ],
  meta: {
    title: '精品软件 | Payload-RDL',
    description: '编辑部实际使用过的精品软件推荐，附收录标准与下载入口。',
  },
}

/** 页面里重点推荐的真实软件条目 */
export const sevenZip = ({
  thumbnail,
  categoryIds = [],
}: {
  thumbnail?: Media
  categoryIds?: number[]
}): RequiredDataFromCollectionSlug<'software'> => ({
  title: '7-Zip',
  slug: '7-zip',
  _status: 'published',
  ...(thumbnail ? { thumbnail: thumbnail.id } : {}),
  summary: '免费开源的高压缩比归档工具，支持 7z/ZIP/RAR 等主流格式，安装包无捆绑。',
  description: richText([
    p(
      '7-Zip 是一款免费开源的文件归档工具，自带的 7z 格式使用 LZMA/LZMA2 算法，压缩率通常优于传统 ZIP。',
    ),
    p(
      '支持解压 RAR、ISO、CAB、DMG、TAR 等数十种格式，提供 AES-256 加密、分卷压缩、命令行版本与资源管理器右键集成。',
    ),
    p('官方站点：https://www.7-zip.org/'),
  ]),
  version: '24.09',
  platform: ['windows', 'linux'],
  categories: categoryIds,
  featured: true,
  downloadFiles: [
    {
      label: '24.09 Windows 64 位安装包',
      platform: 'windows',
      fileSize: '1.6 MB',
      requiredRole: 'user',
      fileSource: 'url',
      url: 'https://www.7-zip.org/a/7z2409-x64.exe',
    },
    {
      label: '24.09 Linux x64',
      platform: 'linux',
      fileSize: '1.5 MB',
      requiredRole: 'user',
      fileSource: 'url',
      url: 'https://www.7-zip.org/a/7z2409-linux-x64.tar.xz',
    },
  ],
})
