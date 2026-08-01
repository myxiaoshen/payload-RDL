import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    label: '栏宽',
    defaultValue: 'oneThird',
    options: [
      {
        label: '三分之一（1/3）',
        value: 'oneThird',
      },
      {
        label: '一半（1/2）',
        value: 'half',
      },
      {
        label: '三分之二（2/3）',
        value: 'twoThirds',
      },
      {
        label: '整行（全宽）',
        value: 'full',
      },
    ],
    admin: {
      description: '多个小于整行的栏会自动并排在同一行。',
    },
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: '正文',
  },
  {
    name: 'enableLink',
    type: 'checkbox',
    label: '在本栏底部添加按钮',
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink)
        },
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  labels: {
    singular: '图文内容',
    plural: '图文内容',
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: '内容栏',
      labels: { singular: '栏', plural: '栏' },
      minRows: 1,
      admin: {
        initCollapsed: true,
        description: '一个「图文内容」板块可以包含多栏，用栏宽控制分栏布局。',
      },
      fields: columnFields,
    },
  ],
}
