import type { Access, CollectionConfig, Where } from 'payload'

import { isAdminFieldLevel } from '@/access/isAdmin'
import { slugFieldZh } from '@/fields/slug'
import { ensureUniqueSlug } from '@/hooks/ensureUniqueSlug'

/** 作者仅能在「待审核」状态下修改自己的资源；管理员可改任何资源。 */
const canMutate: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  const and: Where[] = [{ author: { equals: user.id } }, { status: { equals: 'pending' } }]
  return { and }
}

/** 已上架资源任何人可见；作者可见自己全部；管理员可见全部。 */
const canRead: Access = ({ req: { user } }) => {
  if (user?.role === 'admin') return true
  if (user) {
    const or: Where[] = [{ status: { equals: 'approved' } }, { author: { equals: user.id } }]
    return { or } as Where
  }
  return { status: { equals: 'approved' } } as Where
}

export const MarketResources: CollectionConfig<'market-resources'> = {
  slug: 'market-resources',
  labels: {
    singular: '交易资源',
    plural: '交易资源',
  },
  access: {
    create: ({ req: { user } }) => Boolean(user),
    delete: canMutate,
    read: canRead,
    update: canMutate,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    summary: true,
    coverImage: true,
    price: true,
    productType: true,
    salesCount: true,
    author: true,
    status: true,
  },
  admin: {
    group: '交易市场',
    defaultColumns: ['title', 'productType', 'author', 'price', 'salesCount', 'status', 'createdAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '资源名称',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      label: '简介',
      required: true,
      maxLength: 200,
      admin: { description: '显示在列表页的一句话简介' },
    },
    {
      name: 'description',
      type: 'richText',
      label: '资源介绍',
    },
    {
      name: 'coverImage',
      type: 'upload',
      label: '封面图',
      relationTo: 'media',
    },
    {
      name: 'downloadFile',
      type: 'group',
      label: '下载文件',
      // 下载地址仅管理员可读，买家须经购买端点获取，避免直接从 API 拿到直链。
      access: {
        read: isAdminFieldLevel,
      },
      admin: {
        description: '购买成功的用户才能通过下载端点获取此地址',
      },
      fields: [
        {
          name: 'fileSource',
          type: 'radio',
          label: '文件来源',
          defaultValue: 'url',
          options: [
            { label: '外部链接', value: 'url' },
            { label: '本地上传', value: 'upload' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          label: '下载地址',
          admin: {
            condition: (_, siblingData) => siblingData?.fileSource === 'url',
          },
        },
        {
          name: 'file',
          type: 'upload',
          label: '上传文件',
          relationTo: 'media',
          admin: {
            condition: (_, siblingData) => siblingData?.fileSource === 'upload',
          },
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      label: '分类',
      relationTo: 'market-categories',
      admin: { position: 'sidebar' },
    },
    {
      name: 'productType',
      type: 'select',
      label: '商品类型',
      defaultValue: 'normal',
      options: [
        { label: '普通资源', value: 'normal' },
        { label: 'VIP 会员', value: 'membership' },
      ],
      access: {
        // 仅管理员可把商品设为会员权益，避免用户自行发布「VIP」商品。
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
      admin: {
        position: 'sidebar',
        description: '选择「VIP 会员」后，用户购买该商品即自动升级为 VIP，售价即会员价格',
      },
    },
    {
      name: 'price',
      type: 'number',
      label: '售价 (Coin)',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: '作者',
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'salesCount',
      type: 'number',
      label: '销量',
      defaultValue: 0,
      access: {
        // 仅购买端点（overrideAccess）可写。
        update: () => false,
      },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      label: '审核状态',
      defaultValue: 'pending',
      options: [
        { label: '待审核', value: 'pending' },
        { label: '已上架', value: 'approved' },
        { label: '已拒绝', value: 'rejected' },
      ],
      access: {
        // 仅管理员可改审核状态，作者无法自行上架。
        update: isAdminFieldLevel,
      },
      admin: { position: 'sidebar' },
    },
    slugFieldZh(),
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        if (!data) return data

        if (operation === 'create' && req.user) {
          data.author = req.user.id
          if (req.user.role !== 'admin') data.status = 'pending'
        }

        // 前台发布表单不经过后台的客户端 slug 生成，这里补齐并保证唯一。
        if (!data.slug) {
          data.slug = await ensureUniqueSlug({
            collection: 'market-resources',
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
