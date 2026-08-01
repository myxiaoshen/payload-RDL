import type { Access, CollectionConfig, Where } from 'payload'

import { isAdminFieldLevel } from '@/access/isAdmin'

/** 该悬赏的发起人、提交者本人、管理员可读；其余不可读。 */
const canRead: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  // 提交者本人可见自己的提交；悬赏发起人的可见性由前台查询显式带 user 处理。
  const or: Where[] = [{ submitter: { equals: user.id } }]
  return { or } as Where
}

export const BountySubmissions: CollectionConfig<'bounty-submissions'> = {
  slug: 'bounty-submissions',
  labels: {
    singular: '悬赏提交',
    plural: '悬赏提交',
  },
  access: {
    // 提交须经 /api/bounty/submit 端点，禁止直接 REST 创建。
    create: () => false,
    delete: ({ req: { user } }) => user?.role === 'admin',
    read: canRead,
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  admin: {
    group: '任务悬赏',
    defaultColumns: ['bounty', 'submitter', 'status', 'createdAt'],
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'bounty',
      type: 'relationship',
      relationTo: 'bounties',
      label: '所属悬赏',
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'submitter',
      type: 'relationship',
      relationTo: 'users',
      label: '提交者',
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'content',
      type: 'richText',
      label: '方案说明',
    },
    {
      name: 'downloadFile',
      type: 'group',
      label: '下载文件',
      // 下载地址仅管理员通过 API 可读，发起人须采纳后经下载端点获取，避免直接拿直链。
      access: {
        read: isAdminFieldLevel,
      },
      admin: {
        description: '悬赏被采纳后，发起人可通过下载端点获取此地址',
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
      name: 'note',
      type: 'textarea',
      label: '补充备注',
      maxLength: 500,
    },
    {
      name: 'status',
      type: 'select',
      label: '状态',
      defaultValue: 'submitted',
      options: [
        { label: '已提交', value: 'submitted' },
        { label: '已采纳', value: 'accepted' },
        { label: '未采纳', value: 'rejected' },
      ],
      access: {
        update: () => false,
      },
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  timestamps: true,
}
