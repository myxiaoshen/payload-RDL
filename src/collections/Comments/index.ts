import type { Access, CollectionConfig, Where } from 'payload'

import { authenticated } from '@/access/authenticated'

const isAdminOrOwner: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return { author: { equals: user.id } }
}

export const Comments: CollectionConfig = {
  slug: 'comments',
  labels: {
    singular: '评论',
    plural: '评论',
  },
  access: {
    // 仅登录用户可发表评论
    create: authenticated,
    delete: isAdminOrOwner,
    update: isAdminOrOwner,
    // 游客只看已审核通过；登录用户额外能看到自己的全部评论（含待审核）；管理员看全部
    read: (({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user) {
        const where: Where = {
          or: [{ status: { equals: 'approved' } }, { author: { equals: user.id } }],
        }
        return where
      }
      return { status: { equals: 'approved' } } as Where
    }) as Access,
  },
  admin: {
    group: '互动',
    defaultColumns: ['content', 'author', 'relatedTo', 'status', 'createdAt'],
    useAsTitle: 'content',
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
      label: '评论内容',
      required: true,
      maxLength: 2000,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: '作者',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'relatedTo',
      type: 'relationship',
      relationTo: ['posts', 'software'],
      label: '评论对象',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'comments',
      label: '父评论（楼中楼）',
      admin: {
        position: 'sidebar',
        description: '有值时表示这是对某条评论的回复',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: '审核状态',
      defaultValue: 'pending',
      index: true,
      options: [
        { label: '待审核', value: 'pending' },
        { label: '已通过', value: 'approved' },
        { label: '垃圾评论', value: 'spam' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, req, operation }) => {
        if (operation === 'create' && data) {
          // 强制作者为当前登录用户，状态回落到待审核（管理员在后台可直接改）
          if (req.user && req.user.role !== 'admin') {
            data.author = req.user.id
            data.status = 'pending'
          } else if (req.user && !data.author) {
            data.author = req.user.id
          }
        }
        return data
      },
    ],
  },
  timestamps: true,
}
