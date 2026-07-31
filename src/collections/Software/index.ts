import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { slugField } from 'payload'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { authenticatedDownload } from '../../access/authenticatedDownload'
import { isAdmin } from '../../access/isAdmin'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidateSoftware } from './hooks/revalidateSoftware'

export const platformOptions = [
  { label: 'Windows', value: 'windows' },
  { label: 'macOS', value: 'macos' },
  { label: 'Linux', value: 'linux' },
  { label: 'Android', value: 'android' },
  { label: 'iOS', value: 'ios' },
  { label: 'Web', value: 'web' },
]

export const Software: CollectionConfig<'software'> = {
  slug: 'software',
  labels: {
    singular: '软件',
    plural: '软件',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticatedOrPublished,
    update: isAdmin,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    version: true,
    summary: true,
    thumbnail: true,
    platform: true,
    categories: true,
    downloadCount: true,
  },
  admin: {
    group: '软件库',
    defaultColumns: ['title', 'version', 'downloadCount', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'software',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'software',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '软件名称',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: '基本信息',
          fields: [
            {
              name: 'thumbnail',
              type: 'upload',
              label: '软件图标',
              relationTo: 'media',
            },
            {
              name: 'summary',
              type: 'textarea',
              label: '简短描述',
              maxLength: 200,
              admin: {
                description: '显示在列表页的一句话简介',
              },
            },
            {
              name: 'description',
              type: 'richText',
              label: '详细介绍',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                  HorizontalRuleFeature(),
                ],
              }),
            },
            {
              name: 'screenshots',
              type: 'array',
              label: '软件截图',
              labels: { singular: '截图', plural: '截图' },
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  label: '图片',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: '下载',
          fields: [
            {
              name: 'downloadFiles',
              type: 'array',
              label: '下载文件',
              labels: { singular: '下载项', plural: '下载项' },
              access: {
                read: authenticatedDownload,
              },
              admin: {
                initCollapsed: true,
                description: '未登录访客无法通过 API 获取这些下载地址',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  label: '版本标签',
                  required: true,
                  admin: { description: '例如：v2.1.0 Windows 64 位' },
                },
                {
                  name: 'platform',
                  type: 'select',
                  label: '适用平台',
                  options: platformOptions,
                },
                {
                  name: 'fileSize',
                  type: 'text',
                  label: '文件大小',
                  admin: { description: '例如：32.5 MB' },
                },
                {
                  name: 'requiredRole',
                  type: 'select',
                  label: '下载权限',
                  defaultValue: 'user',
                  options: [
                    { label: '所有登录用户', value: 'user' },
                    { label: 'VIP 用户及以上', value: 'vip' },
                    { label: '仅管理员', value: 'admin' },
                  ],
                  admin: {
                    description: '低于此等级的用户无法下载该文件',
                  },
                },
                {
                  name: 'fileSource',
                  type: 'radio',
                  label: '文件来源',
                  defaultValue: 'upload',
                  options: [
                    { label: '本地上传', value: 'upload' },
                    { label: '外部链接', value: 'url' },
                  ],
                },
                {
                  name: 'file',
                  type: 'upload',
                  label: '上传文件',
                  relationTo: 'media',
                  admin: {
                    condition: (_, siblingData) => siblingData?.fileSource === 'upload',
                  },
                },
                {
                  name: 'url',
                  type: 'text',
                  label: '下载地址',
                  admin: {
                    condition: (_, siblingData) => siblingData?.fileSource === 'url',
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'version',
      type: 'text',
      label: '当前版本',
      admin: { position: 'sidebar' },
    },
    {
      name: 'platform',
      type: 'select',
      label: '支持平台',
      hasMany: true,
      options: platformOptions,
      admin: { position: 'sidebar' },
    },
    {
      name: 'categories',
      type: 'relationship',
      label: '软件分类',
      relationTo: 'categories',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: '推荐置顶',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'downloadCount',
      type: 'number',
      label: '下载次数',
      defaultValue: 0,
      access: {
        // Only the download endpoint (which runs with overrideAccess) may write this.
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: '发布时间',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateSoftware],
    afterDelete: [revalidateDelete],
    beforeChange: [populatePublishedAt],
  },
  versions: {
    drafts: {
      autosave: { interval: 100 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
