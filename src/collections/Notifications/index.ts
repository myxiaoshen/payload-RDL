import type { Access, CollectionConfig, Where } from 'payload'

import { isAdmin } from '@/access/isAdmin'

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  labels: {
    singular: '通知',
    plural: '通知',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    update: isAdmin,
    // 用户只能读取面向自己（全体 或 匹配角色）且启用中的通知
    read: (({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      const where: Where = {
        and: [{ isActive: { equals: true } }, { audience: { in: ['all', user.role || 'user'] } }],
      }
      return where
    }) as Access,
  },
  admin: {
    group: '互动',
    defaultColumns: ['title', 'audience', 'isActive', 'createdAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '标题',
      required: true,
      maxLength: 120,
    },
    {
      name: 'message',
      type: 'textarea',
      label: '内容',
      required: true,
      maxLength: 2000,
    },
    {
      name: 'audience',
      type: 'select',
      label: '接收对象',
      defaultValue: 'all',
      required: true,
      options: [
        { label: '全体用户', value: 'all' },
        { label: '仅普通用户', value: 'user' },
        { label: '仅 VIP', value: 'vip' },
        { label: '仅管理员', value: 'admin' },
      ],
    },
    {
      name: 'link',
      type: 'text',
      label: '跳转链接（可选）',
      admin: {
        description: '例如 /software/xxx，点击通知时跳转',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: '启用',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
