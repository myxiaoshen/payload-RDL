import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin, isAdminBoolean, isAdminFieldLevel } from '../../access/isAdmin'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: '用户',
    plural: '用户',
  },
  access: {
    admin: isAdminBoolean,
    create: () => true,
    delete: isAdmin,
    read: authenticated,
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return user.id === id
    },
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '姓名',
    },
    {
      name: 'role',
      type: 'select',
      label: '角色',
      defaultValue: 'user',
      options: [
        { label: '普通用户', value: 'user' },
        { label: '管理员', value: 'admin' },
      ],
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      label: '头像',
      relationTo: 'media',
    },
  ],
  timestamps: true,
}
