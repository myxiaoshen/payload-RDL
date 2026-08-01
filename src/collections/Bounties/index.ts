import type { Access, CollectionConfig, Where } from 'payload'

import { isAdminFieldLevel } from '@/access/isAdmin'
import { slugFieldZh } from '@/fields/slug'
import { ensureUniqueSlug } from '@/hooks/ensureUniqueSlug'

/** 作者仅能在「待审核」状态下修改自己的悬赏；管理员可改任何悬赏。 */
const canMutate: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  const and: Where[] = [{ author: { equals: user.id } }, { status: { equals: 'pending' } }]
  return { and }
}

/** 进行中/已完成/已关闭的悬赏任何人可见；作者可见自己全部；管理员可见全部。 */
const canRead: Access = ({ req: { user } }) => {
  if (user?.role === 'admin') return true
  const publicStatuses = { status: { in: ['open', 'fulfilled', 'closed'] } } as Where
  if (user) {
    const or: Where[] = [publicStatuses, { author: { equals: user.id } }]
    return { or } as Where
  }
  return publicStatuses
}

export const Bounties: CollectionConfig<'bounties'> = {
  slug: 'bounties',
  labels: {
    singular: '悬赏任务',
    plural: '悬赏任务',
  },
  access: {
    // 发布须经 /api/bounty/publish 端点（含托管扣币），禁止直接 REST 创建。
    create: () => false,
    delete: canMutate,
    read: canRead,
    update: canMutate,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    summary: true,
    coverImage: true,
    reward: true,
    submissionCount: true,
    author: true,
    status: true,
    category: true,
  },
  admin: {
    group: '任务悬赏',
    defaultColumns: ['title', 'author', 'reward', 'submissionCount', 'status', 'createdAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '需求标题',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      label: '简介',
      required: true,
      maxLength: 200,
      admin: { description: '显示在列表页的一句话需求描述' },
    },
    {
      name: 'description',
      type: 'richText',
      label: '需求详情',
    },
    {
      name: 'coverImage',
      type: 'upload',
      label: '封面图',
      relationTo: 'media',
    },
    {
      name: 'category',
      type: 'relationship',
      label: '分类',
      relationTo: 'bounty-categories',
      admin: { position: 'sidebar' },
    },
    {
      name: 'reward',
      type: 'number',
      label: '悬赏 (Coin)',
      required: true,
      min: 1,
      defaultValue: 1,
      admin: { position: 'sidebar', description: '发布时从余额冻结，采纳后发放给完成者' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: '发起人',
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'submissionCount',
      type: 'number',
      label: '提交数',
      defaultValue: 0,
      access: {
        // 仅提交端点（overrideAccess）可写。
        update: () => false,
      },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'acceptedSubmission',
      type: 'relationship',
      relationTo: 'bounty-submissions',
      label: '已采纳方案',
      access: {
        update: () => false,
      },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'escrowReleased',
      type: 'checkbox',
      label: '悬赏已结算',
      defaultValue: false,
      access: {
        // 仅采纳/关闭端点可写，避免重复发放或退款。
        update: () => false,
      },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'deadline',
      type: 'date',
      label: '截止时间（可选）',
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      label: '状态',
      defaultValue: 'pending',
      options: [
        { label: '待审核', value: 'pending' },
        { label: '进行中', value: 'open' },
        { label: '已完成', value: 'fulfilled' },
        { label: '已关闭', value: 'closed' },
        { label: '已驳回', value: 'rejected' },
      ],
      access: {
        // 仅管理员可改状态（审核上架/驳回），作者无法自行上架。
        update: isAdminFieldLevel,
      },
      admin: { position: 'sidebar' },
    },
    slugFieldZh(),
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (!data) return data

        // 前台发布表单不经过后台的客户端 slug 生成，这里补齐并保证唯一。
        if (!data.slug) {
          data.slug = await ensureUniqueSlug({
            collection: 'bounties',
            currentId: originalDoc?.id,
            req,
          })
        }

        return data
      },
    ],
  },
  timestamps: true,
}
