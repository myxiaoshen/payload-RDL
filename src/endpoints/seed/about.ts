import type { RequiredDataFromCollectionSlug } from 'payload'

import { simpleRichText } from './software'

export const about: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'about',
  _status: 'published',
  title: '关于我们',
  hero: {
    type: 'lowImpact',
    richText: simpleRichText([
      '关于我们',
      '我们致力于分享优质的软件资源与技术内容，帮助用户高效地发现与使用好工具。',
    ]),
  },
  layout: [
    {
      blockName: '介绍',
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: simpleRichText([
            '这是一个用于演示的关于页面。你可以在后台自由编辑本页的内容与布局。',
          ]),
        },
      ],
    },
  ],
}
