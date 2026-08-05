import type { GlobalConfig, TextFieldSingleValidation, UploadFieldSingleValidation } from 'payload'

import { link } from '@/fields/link'
import { isAdmin } from '@/access/isAdmin'
import { revalidateHomepageHero } from './hooks/revalidateHomepageHero'

export const HomepageHero: GlobalConfig = {
  slug: 'homepage-hero',
  label: '首页 Hero',
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'menuItems',
      type: 'array',
      label: '左侧软件菜单',
      maxRows: 12,
      admin: {
        description: '自定义菜单名称与跳转路径，字段语义与页眉/页脚导航一致。',
        initCollapsed: true,
        components: {
          RowLabel: '@/HomepageHero/RowLabel#MenuRowLabel',
        },
      },
      fields: [
        link({
          appearances: false,
        }),
      ],
    },
    {
      name: 'slides',
      type: 'array',
      label: '右侧轮播',
      maxRows: 8,
      admin: {
        description: '每条为图片型或视频型二选一；图片可配可选链接，视频支持外链或媒体库。',
        initCollapsed: true,
        components: {
          RowLabel: '@/HomepageHero/RowLabel#SlideRowLabel',
        },
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          label: '类型',
          defaultValue: 'image',
          required: true,
          options: [
            { label: '图片', value: 'image' },
            { label: '视频', value: 'video' },
          ],
        },
        {
          name: 'title',
          type: 'text',
          label: '标题',
          admin: {
            description: '显示在轮播上的主文案。',
          },
        },
        {
          name: 'subtitle',
          type: 'textarea',
          label: '副文案',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: '图片',
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'image',
            description: '图片型必填。从媒体库选择或上传。',
          },
          validate: ((value, { siblingData }) => {
            if ((siblingData as { type?: string })?.type !== 'image') return true
            if (!value) return '请选择轮播图片'
            return true
          }) as UploadFieldSingleValidation,
        },
        {
          name: 'enableLink',
          type: 'checkbox',
          label: '添加跳转链接',
          defaultValue: false,
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'image',
            description: '开启后可为该图片配置站内或自定义跳转。',
          },
        },
        link({
          appearances: false,
          overrides: {
            name: 'link',
            label: '跳转链接',
            admin: {
              condition: (_data, siblingData) =>
                siblingData?.type === 'image' && Boolean(siblingData?.enableLink),
              description: '配置后前台会在轮播上展示跳转按钮。',
            },
          },
        }),
        {
          name: 'videoSource',
          type: 'select',
          label: '视频来源',
          defaultValue: 'url',
          options: [
            { label: '外部链接（直链或 YouTube/Bilibili/Vimeo）', value: 'url' },
            { label: '媒体库上传', value: 'upload' },
          ],
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'video',
          },
        },
        {
          name: 'videoUrl',
          type: 'text',
          label: '视频地址',
          admin: {
            condition: (_data, siblingData) =>
              siblingData?.type === 'video' && siblingData?.videoSource !== 'upload',
            description:
              '支持 mp4/webm 等直链，也支持 YouTube、Bilibili、Vimeo 的视频页地址（会自动转换为播放器）。',
          },
          validate: ((value, { siblingData }) => {
            const data = siblingData as { type?: string; videoSource?: string }
            if (data?.type !== 'video' || data?.videoSource === 'upload') return true
            if (!value) return '请填写视频地址'
            try {
              const { protocol } = new URL(value)
              if (protocol !== 'http:' && protocol !== 'https:') {
                return '仅支持 http/https 开头的地址'
              }
            } catch {
              return '请填写合法的 URL，例如 https://example.com/video.mp4'
            }
            return true
          }) as TextFieldSingleValidation,
        },
        {
          name: 'videoMedia',
          type: 'upload',
          relationTo: 'media',
          label: '视频文件',
          admin: {
            condition: (_data, siblingData) =>
              siblingData?.type === 'video' && siblingData?.videoSource === 'upload',
            description: '从媒体库选择已上传的视频文件（mp4/webm 等）。',
          },
          validate: ((value, { siblingData }) => {
            const data = siblingData as { type?: string; videoSource?: string }
            if (data?.type !== 'video' || data?.videoSource !== 'upload') return true
            if (!value) return '请选择视频文件'
            return true
          }) as UploadFieldSingleValidation,
        },
        {
          name: 'poster',
          type: 'upload',
          relationTo: 'media',
          label: '封面图',
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'video',
            description: '可选。仅对直链 / 上传的视频生效，第三方播放器使用其自带封面。',
          },
        },
        {
          name: 'caption',
          type: 'text',
          label: '视频说明',
          admin: {
            condition: (_data, siblingData) => siblingData?.type === 'video',
          },
        },
      ],
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      label: '自动轮播',
      defaultValue: true,
      admin: {
        description: '开启后多张轮播约按间隔自动切换；悬停或当前为视频时会暂停。',
      },
    },
    {
      name: 'autoplayIntervalMs',
      type: 'number',
      label: '自动切换间隔（毫秒）',
      defaultValue: 5000,
      min: 2000,
      max: 20000,
      admin: {
        condition: (_data, siblingData) => Boolean(siblingData?.autoplay),
        description: '建议 3000–8000。默认 5000。',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHomepageHero],
  },
}
