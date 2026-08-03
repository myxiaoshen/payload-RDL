import type { CollectionConfig } from 'payload'

import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { isAdmin } from '../../access/isAdmin'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FeaturedSoftware } from '../../blocks/FeaturedSoftware/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { Video } from '../../blocks/Video/config'
import { hero } from '@/heros/config'
import { slugFieldZh } from '@/fields/slug'
import { contentModeExtraFields, contentTypeField, isRichTextMode } from '@/fields/contentMode'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: {
    singular: '页面',
    plural: '页面',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticatedOrPublished,
    update: isAdmin,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    group: '内容',
    description:
      '用于搭建「关于我们」「精品软件」等独立页面。页面由「主视觉 + 若干内容板块」组成，保存后访问路径为 /访问路径。',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '标题',
      required: true,
      admin: {
        description: '页面名称，同时用于浏览器标签与后台列表，例如「关于我们」。',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: '主视觉',
          description: '页面顶部的横幅区域。不需要横幅时，把「展示样式」选为「不显示」即可。',
        },
        {
          fields: [
            contentTypeField({ richTextLabel: '板块布局' }),
            {
              name: 'layout',
              type: 'blocks',
              blocks: [Content, MediaBlock, Video, FeaturedSoftware, Archive, CallToAction],
              label: '内容板块',
              labels: { singular: '板块', plural: '板块' },
              required: true,
              minRows: 1,
              admin: {
                initCollapsed: true,
                condition: isRichTextMode,
                description:
                  '点击「添加板块」按从上到下的顺序拼装页面，板块左侧可拖拽排序。至少需要一个板块。',
              },
            },
            ...contentModeExtraFields,
          ],
          label: '内容',
          description: '页面正文由一个个板块堆叠而成，可自由增删和排序。',
        },
        {
          name: 'meta',
          label: 'SEO',
          description: '搜索引擎与社交平台分享时展示的标题、描述和缩略图，可留空自动生成。',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: '发布时间',
      admin: {
        position: 'sidebar',
        description: '留空则在首次发布时自动填入当前时间。',
      },
    },
    slugFieldZh(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
