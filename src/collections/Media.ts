import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { isAdmin } from '../access/isAdmin'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: '媒体',
    plural: '媒体',
  },
  folders: true,
  access: {
    create: authenticated,
    delete: isAdmin,
    read: anyone,
    update: isAdmin,
  },
  admin: {
    group: '系统',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: '替代文字',
      //required: true,
    },
    {
      name: 'externalUrl',
      type: 'text',
      label: '外部图片地址',
      admin: {
        description:
          '填写一个网络图片 URL（如 https://picsum.photos/800/600）。填写后前台将优先使用该地址显示，可不上传本地文件。',
      },
    },
    {
      name: 'caption',
      type: 'richText',
      label: '说明文字',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    // 允许仅填写外部图片地址、不上传本地文件的媒体记录
    filesRequiredOnCreate: false,
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
