import type { RequiredDataFromCollectionSlug } from 'payload'

import { h, p, richText, ul } from './rich-text'

export const about: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'about',
  _status: 'published',
  title: '关于我们',
  hero: {
    type: 'lowImpact',
    richText: richText([
      h('h1', '关于我们'),
      p(
        'Payload-RDL 是一个资源下载与学习平台：把值得用的软件、值得读的文章，整理成一份可以长期使用的清单。',
      ),
    ]),
  },
  layout: [
    {
      blockName: '我们是谁',
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: richText([
            h('h2', '我们是谁'),
            p(
              '我们是一个由开发者和内容爱好者组成的小团队。日常工作里我们踩过太多「下载站」的坑：捆绑安装、版本混乱、说明缺失。于是我们决定自己做一个——每一个上架的软件都写清楚版本、平台、适用场景和下载权限，每一篇文章都尽量给出可复现的步骤。',
            ),
          ]),
        },
      ],
    },
    {
      blockName: '我们提供什么',
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: richText([h('h2', '我们提供什么')]),
        },
        {
          size: 'oneThird',
          richText: richText([
            h('h3', '精选软件库'),
            p('按平台与分类整理的软件资源，标注版本号、体积与下载权限，登录后即可获取下载地址。'),
          ]),
          enableLink: true,
          link: {
            type: 'custom',
            url: '/software',
            label: '浏览软件库',
            appearance: 'default',
          },
        },
        {
          size: 'oneThird',
          richText: richText([
            h('h3', '实用文章与专题'),
            p('围绕工具选型、使用技巧与工作流的长文与专题合集，帮助你把工具真正用起来。'),
          ]),
          enableLink: true,
          link: {
            type: 'custom',
            url: '/posts',
            label: '阅读文章',
            appearance: 'default',
          },
        },
        {
          size: 'oneThird',
          richText: richText([
            h('h3', '资源交易与互助'),
            p('会员可以在资源市场发布与获取资源，用积分完成流转，形成社区内部的正向循环。'),
          ]),
          enableLink: true,
          link: {
            type: 'custom',
            url: '/market',
            label: '进入资源市场',
            appearance: 'default',
          },
        },
      ],
    },
    {
      blockName: '我们的原则',
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: richText([
            h('h2', '我们的原则'),
            ul([
              '干净：不做捆绑安装包，不做诱导下载，官方来源优先。',
              '透明：标明版本、更新时间与授权方式，付费软件不提供破解内容。',
              '克制：宁可少收录，也不堆砌数量，每一条都要有人真正用过。',
              '尊重：用户数据只用于账号与下载记录本身，不做二次分发。',
            ]),
          ]),
        },
      ],
    },
    {
      blockName: '联系我们',
      blockType: 'cta',
      richText: richText([
        h('h2', '有想推荐的软件，或者发现了问题？'),
        p('欢迎把它告诉我们。收录建议、失效链接、内容纠错，我们都会认真看。'),
      ]),
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: '联系我们',
            url: '/contact',
          },
        },
        {
          link: {
            type: 'custom',
            appearance: 'outline',
            label: '看看精品软件',
            url: '/featured-software',
          },
        },
      ],
    },
  ],
  meta: {
    title: '关于我们 | Payload-RDL',
    description: '了解 Payload-RDL 的团队、我们提供的内容，以及我们收录资源时坚持的原则。',
  },
}
