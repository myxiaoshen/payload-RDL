import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  labels: {
    singular: '图片',
    plural: '图片',
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      label: '图片',
      relationTo: 'media',
      required: true,
      admin: {
        description: '从媒体库选择或直接上传，图片说明文字在媒体库的「说明」字段里编辑。',
      },
    },
  ],
}
