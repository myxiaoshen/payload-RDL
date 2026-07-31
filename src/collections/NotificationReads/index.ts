import type { Access, CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

const isAdminOrOwner: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return { user: { equals: user.id } }
}

/**
 * 记录「某用户已读某条通知」。前端据此计算未读数与列表。
 * 后台默认隐藏（属于系统内部数据）。
 */
export const NotificationReads: CollectionConfig = {
  slug: 'notification-reads',
  labels: {
    singular: '通知已读记录',
    plural: '通知已读记录',
  },
  access: {
    create: authenticated,
    delete: isAdminOrOwner,
    read: isAdminOrOwner,
    update: isAdminOrOwner,
  },
  admin: {
    group: '互动',
    hidden: true,
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'notification',
      type: 'relationship',
      relationTo: 'notifications',
      required: true,
      index: true,
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, req, operation }) => {
        if (operation === 'create' && data && req.user) {
          data.user = req.user.id
        }
        return data
      },
    ],
  },
  timestamps: true,
}
