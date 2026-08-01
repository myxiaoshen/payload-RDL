import type { Block, TextFieldSingleValidation, UploadFieldSingleValidation } from 'payload'

export const Video: Block = {
  slug: 'videoBlock',
  interfaceName: 'VideoBlock',
  labels: {
    singular: '视频',
    plural: '视频',
  },
  fields: [
    {
      name: 'source',
      type: 'select',
      label: '视频来源',
      defaultValue: 'url',
      required: true,
      options: [
        { label: '外部链接（直链或 YouTube/Bilibili/Vimeo）', value: 'url' },
        { label: '媒体库上传', value: 'upload' },
      ],
    },
    {
      name: 'url',
      type: 'text',
      label: '视频地址',
      admin: {
        condition: (_data, siblingData) => siblingData?.source !== 'upload',
        description:
          '支持 mp4/webm 等直链，也支持 YouTube、Bilibili、Vimeo 的视频页地址（会自动转换为播放器）。',
      },
      validate: ((value, { siblingData }) => {
        if ((siblingData as { source?: string })?.source === 'upload') return true
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
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      label: '视频文件',
      admin: {
        condition: (_data, siblingData) => siblingData?.source === 'upload',
        description: '从媒体库选择已上传的视频文件（mp4/webm 等）。',
      },
      validate: ((value, { siblingData }) => {
        if ((siblingData as { source?: string })?.source !== 'upload') return true
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
        description: '可选。仅对直链 / 上传的视频生效，第三方播放器使用其自带封面。',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: '视频说明',
    },
    {
      name: 'aspectRatio',
      type: 'select',
      label: '画面比例',
      defaultValue: '16/9',
      options: [
        { label: '16:9 横屏', value: '16/9' },
        { label: '4:3 横屏', value: '4/3' },
        { label: '1:1 方形', value: '1/1' },
        { label: '9:16 竖屏', value: '9/16' },
      ],
    },
  ],
}
