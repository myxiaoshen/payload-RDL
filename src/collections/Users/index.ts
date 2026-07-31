import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin, isAdminBoolean, isAdminFieldLevel } from '../../access/isAdmin'

type UserContext = { skipCoinLog?: boolean }

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
    group: '系统',
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
        { label: 'VIP 用户', value: 'vip' },
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
    {
      name: 'coinBalance',
      type: 'number',
      label: '平台币余额',
      defaultValue: 0,
      min: 0,
      access: {
        // 普通用户不可自行修改余额；管理员可在后台直接发放。
        update: isAdminFieldLevel,
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'lastSigninAt',
      type: 'date',
      label: '最近签到时间',
      access: {
        update: () => false,
      },
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req, operation, context }) => {
        // 管理员在后台直接调整余额时补记一条流水；端点内改动已自行记账（skipCoinLog）。
        if (operation !== 'update') return doc
        if ((context as UserContext)?.skipCoinLog) return doc
        if (req.user?.role !== 'admin') return doc

        const before = previousDoc?.coinBalance ?? 0
        const after = doc?.coinBalance ?? 0
        const delta = after - before
        if (delta === 0) return doc

        await req.payload.create({
          collection: 'coin-transactions',
          data: {
            user: doc.id,
            amount: delta,
            balanceAfter: after,
            type: 'admin-adjust',
            note: '管理员调整',
          },
          depth: 0,
          overrideAccess: true,
          req,
          context: { disableRevalidate: true },
        })

        return doc
      },
    ],
  },
  timestamps: true,
}
