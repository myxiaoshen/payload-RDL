import type { Access, CollectionConfig, Where } from 'payload'

import { isAdmin } from '@/access/isAdmin'

/** 发起人可读本人申诉；管理员/审核员可读全部。 */
const canReadAppeal: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin' || user.role === 'reviewer') return true
  return { applicant: { equals: user.id } } as Where
}

export const Appeals: CollectionConfig = {
  slug: 'appeals',
  labels: {
    singular: '申诉',
    plural: '申诉',
  },
  access: {
    // 创建/更新仅受控端点（overrideAccess）；禁止 REST 直接写入资金相关状态。
    create: () => false,
    delete: isAdmin,
    read: canReadAppeal,
    update: () => false,
  },
  admin: {
    group: '内容审核',
    defaultColumns: ['type', 'applicant', 'status', 'refundAmount', 'createdAt'],
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      label: '类型',
      required: true,
      options: [
        { label: '订单', value: 'order' },
        { label: '悬赏', value: 'bounty' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      label: '关联订单',
      index: true,
      admin: {
        readOnly: true,
        condition: (_, siblingData) => siblingData?.type === 'order',
      },
    },
    {
      name: 'bounty',
      type: 'relationship',
      relationTo: 'bounties',
      label: '关联悬赏',
      index: true,
      admin: {
        readOnly: true,
        condition: (_, siblingData) => siblingData?.type === 'bounty',
      },
    },
    {
      name: 'applicant',
      type: 'relationship',
      relationTo: 'users',
      label: '发起人',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'content',
      type: 'richText',
      label: '申诉详情',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      label: '状态',
      defaultValue: 'pending',
      index: true,
      options: [
        { label: '待处理', value: 'pending' },
        { label: '已批准', value: 'approved' },
        { label: '已驳回', value: 'rejected' },
      ],
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'refundAmount',
      type: 'number',
      label: '退款金额 (Coin)',
      min: 0,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'reviewNote',
      type: 'textarea',
      label: '处理说明',
      admin: { readOnly: true },
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      label: '处理人',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      label: '处理时间',
      admin: { readOnly: true, position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'settled',
      type: 'checkbox',
      label: '已结算',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: '批准退币后置 true，防止重复结算',
      },
    },
  ],
  timestamps: true,
}
