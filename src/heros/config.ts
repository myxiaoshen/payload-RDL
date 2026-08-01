import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: '展示样式',
      options: [
        {
          label: '不显示（页面直接从内容板块开始）',
          value: 'none',
        },
        {
          label: '大图横幅（整屏背景图 + 标题按钮）',
          value: 'highImpact',
        },
        {
          label: '图文横幅（标题按钮在上，配图在下）',
          value: 'mediumImpact',
        },
        {
          label: '纯文字横幅（仅标题与简介，无配图）',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: '横幅文案',
      admin: {
        condition: (_, { type } = {}) => type !== 'none',
        description: '第一行建议用 H1 写页面主标题，再跟一段简短介绍。',
      },
    },
    linkGroup({
      overrides: {
        label: '横幅按钮',
        maxRows: 2,
        admin: {
          condition: (_, { type } = {}) => type !== 'none',
          description: '最多两个按钮，例如「浏览软件」「联系我们」。',
        },
      },
    }),
    {
      name: 'media',
      type: 'upload',
      label: '横幅配图',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
  ],
  label: false,
}
