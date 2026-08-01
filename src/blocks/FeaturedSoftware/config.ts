import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const FeaturedSoftware: Block = {
  slug: 'featuredSoftware',
  interfaceName: 'FeaturedSoftwareBlock',
  labels: {
    singular: '精品软件',
    plural: '精品软件',
  },
  fields: [
    {
      name: 'introContent',
      type: 'richText',
      label: '板块标题与简介',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      admin: {
        description: '显示在软件卡片上方，建议用 H2 写标题，再补一句简短说明。',
      },
    },
    {
      name: 'populateBy',
      type: 'select',
      label: '取数方式',
      defaultValue: 'collection',
      required: true,
      options: [
        { label: '按条件自动筛选', value: 'collection' },
        { label: '手动指定软件', value: 'selection' },
      ],
      admin: {
        description: '自动筛选会随软件库更新而变化；手动指定则完全由你控制顺序。',
      },
    },
    {
      name: 'onlyFeatured',
      type: 'checkbox',
      label: '只显示已标记「精品推荐」的软件',
      defaultValue: true,
      admin: {
        condition: (_, siblingData) => siblingData?.populateBy === 'collection',
        description: '对应软件详情页侧边栏的「精品推荐」开关。',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      label: '限定软件分类',
      relationTo: 'software-categories',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData?.populateBy === 'collection',
        description: '留空表示不限分类。',
      },
    },
    {
      name: 'limit',
      type: 'number',
      label: '最多显示数量',
      defaultValue: 6,
      min: 1,
      max: 24,
      admin: {
        condition: (_, siblingData) => siblingData?.populateBy === 'collection',
        step: 1,
      },
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      label: '指定软件',
      relationTo: 'software',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData?.populateBy === 'selection',
        description: '按拖拽顺序展示。',
      },
    },
    {
      name: 'showMoreLink',
      type: 'checkbox',
      label: '底部显示「查看全部软件」按钮',
      defaultValue: true,
    },
  ],
}
