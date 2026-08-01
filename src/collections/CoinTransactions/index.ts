import type { Access, CollectionConfig } from 'payload'

import { isAdmin } from '@/access/isAdmin'

const isAdminOrOwner: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return { user: { equals: user.id } }
}

export const CoinTransactions: CollectionConfig = {
  slug: 'coin-transactions',
  labels: {
    singular: '平台币流水',
    plural: '平台币流水',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrOwner,
    update: () => false,
  },
  admin: {
    group: '交易市场',
    defaultColumns: ['user', 'type', 'amount', 'balanceAfter', 'createdAt'],
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: '用户',
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'type',
      type: 'select',
      label: '类型',
      required: true,
      options: [
        { label: '每日签到', value: 'signin' },
        { label: '管理员调整', value: 'admin-adjust' },
        { label: '购买支出', value: 'purchase-spend' },
        { label: '销售收入', value: 'sale-income' },
        { label: '购买会员', value: 'membership' },
        { label: '悬赏冻结', value: 'bounty-escrow' },
        { label: '悬赏奖励', value: 'bounty-reward' },
        { label: '悬赏退款', value: 'bounty-refund' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'amount',
      type: 'number',
      label: '变动金额',
      required: true,
      admin: { readOnly: true, description: '正数为收入，负数为支出' },
    },
    {
      name: 'balanceAfter',
      type: 'number',
      label: '变动后余额',
      admin: { readOnly: true },
    },
    {
      name: 'relatedOrder',
      type: 'relationship',
      relationTo: 'orders',
      label: '关联订单',
      admin: { readOnly: true },
    },
    {
      name: 'relatedBounty',
      type: 'relationship',
      relationTo: 'bounties',
      label: '关联悬赏',
      admin: { readOnly: true },
    },
    {
      name: 'note',
      type: 'text',
      label: '备注',
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
}
