import type { Access, CollectionConfig, Where } from 'payload'

import { isAdmin } from '@/access/isAdmin'

const canReadOrder: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  const or: Where[] = [{ buyer: { equals: user.id } }, { seller: { equals: user.id } }]
  return { or }
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: '订单',
    plural: '订单',
  },
  access: {
    // 订单仅由购买端点创建（overrideAccess），禁止直接经 API 创建。
    create: () => false,
    delete: isAdmin,
    read: canReadOrder,
    update: isAdmin,
  },
  admin: {
    group: '交易市场',
    defaultColumns: ['resource', 'resourceTitle', 'buyer', 'seller', 'price', 'createdAt'],
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'buyer',
      type: 'relationship',
      relationTo: 'users',
      label: '买家',
      // 删除用户时外键会置空，这里不能设必填，否则删除用户会报非空约束错误。
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'resource',
      type: 'relationship',
      relationTo: 'market-resources',
      label: '资源',
      // 不设必填：资源被删除时外键会置空，否则删除会因非空约束失败。
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'resourceTitle',
      type: 'text',
      label: '资源名称',
      admin: { readOnly: true, description: '下单时的快照，资源删除后仍可追溯' },
    },
    {
      name: 'seller',
      type: 'relationship',
      relationTo: 'users',
      label: '作者',
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'price',
      type: 'number',
      label: '成交价 (Coin)',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      label: '状态',
      defaultValue: 'paid',
      options: [{ label: '已完成', value: 'paid' }],
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
}
