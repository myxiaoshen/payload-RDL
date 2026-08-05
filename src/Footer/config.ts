import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { isAdmin } from '@/access/isAdmin'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: '页脚',
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'description',
      type: 'textarea',
      label: '站点描述',
      defaultValue: '资源下载与学习平台，汇聚软件、教程与优质资源。',
      admin: {
        description: '显示在页脚 Logo 下方的简介文案。',
      },
    },
    {
      name: 'quickLinks',
      type: 'array',
      label: '快捷链接',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 8,
      admin: {
        description: '前台「快速链接」栏目，可自定义标签与路径。',
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'navItems',
      type: 'array',
      label: '更多链接',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        description: '前台「更多」栏目。',
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
