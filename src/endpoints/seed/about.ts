import type { RequiredDataFromCollectionSlug } from 'payload'

import { h, p, richText, ul } from './rich-text'

export const about: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'about',
  _status: 'published',
  contentType: 'richText',
  title: '关于我们',
  hero: {
    type: 'lowImpact',
    richText: richText([
      h('h1', '关于 Payload-RDL'),
      p('我们专注于整理实用软件与技术内容，提供可信赖的下载与学习入口。'),
    ]),
  },
  layout: [
    {
      blockName: '团队介绍',
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: richText([
            h('h2', '我们的目标'),
            p('帮助用户快速找到可用、干净、长期维护的工具，并理解这些工具的使用场景。'),
          ]),
        },
        {
          size: 'half',
          richText: richText([
            h('h3', '我们坚持'),
            ul([
              '来源可追溯，优先官方发布渠道。',
              '内容可复查，避免夸大宣传。',
              '持续更新，及时修正过期信息。',
            ]),
          ]),
        },
        {
          size: 'half',
          richText: richText([
            h('h3', '联系与反馈'),
            p('如果你发现错误信息、失效链接或想推荐软件，欢迎通过联系我们页面提交反馈。'),
          ]),
          enableLink: true,
          link: {
            type: 'custom',
            appearance: 'default',
            label: '前往联系我们',
            url: '/contact',
          },
        },
      ],
    },
  ],
  meta: {
    title: '关于我们 | Payload-RDL',
    description: '了解 Payload-RDL 的定位、收录标准与反馈方式。',
  },
}
