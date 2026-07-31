import type { Access, CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

const isAdminOrOwner: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return { user: { equals: user.id } }
}

export const Favorites: CollectionConfig = {
  slug: 'favorites',
  labels: {
    singular: '收藏',
    plural: '收藏',
  },
  access: {
    create: authenticated,
    delete: isAdminOrOwner,
    read: isAdminOrOwner,
    update: isAdminOrOwner,
  },
  admin: {
    group: '互动',
    defaultColumns: ['user', 'doc', 'createdAt'],
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: '用户',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'doc',
      type: 'relationship',
      relationTo: ['posts', 'software'],
      label: '收藏对象',
      required: true,
      index: true,
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data && req.user) {
          data.user = req.user.id
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, req, operation }) => {
        // 防止同一用户重复收藏同一对象
        if (operation === 'create' && req.user && data?.doc) {
          const docValue = data.doc
          const relationTo =
            typeof docValue === 'object' && docValue !== null ? docValue.relationTo : undefined
          const value =
            typeof docValue === 'object' && docValue !== null ? docValue.value : docValue

          if (relationTo && value != null) {
            const existing = await req.payload.find({
              collection: 'favorites',
              where: {
                and: [
                  { user: { equals: req.user.id } },
                  { 'doc.relationTo': { equals: relationTo } },
                  { 'doc.value': { equals: value } },
                ],
              },
              limit: 1,
              depth: 0,
            })
            if (existing.docs.length > 0) {
              throw new Error('已经收藏过了')
            }
          }
        }
        return data
      },
    ],
  },
  timestamps: true,
}
