import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { isAdmin, isAdminFieldLevel } from '@/access/isAdmin'

export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: {
    singular: '在线留言',
    plural: '在线留言',
  },
  access: {
    create: anyone,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    group: '系统',
    defaultColumns: ['name', 'email', 'subject', 'status', 'createdAt'],
    useAsTitle: 'subject',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '姓名',
      required: true,
      maxLength: 60,
    },
    {
      name: 'email',
      type: 'email',
      label: '邮箱',
      required: true,
    },
    {
      name: 'subject',
      type: 'text',
      label: '主题',
      required: true,
      maxLength: 100,
    },
    {
      name: 'software',
      type: 'text',
      label: '相关软件',
      admin: {
        description: '可选：用户反馈对应的软件名称',
      },
    },
    {
      name: 'contactMethod',
      type: 'select',
      label: '希望联系方式',
      defaultValue: 'email',
      options: [
        { label: '邮箱回复', value: 'email' },
        { label: '不需要回复', value: 'none' },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
      label: '留言内容',
      required: true,
      maxLength: 2000,
    },
    {
      name: 'status',
      type: 'select',
      label: '处理状态',
      defaultValue: 'new',
      options: [
        { label: '未处理', value: 'new' },
        { label: '处理中', value: 'processing' },
        { label: '已处理', value: 'resolved' },
      ],
      access: {
        create: () => false,
        update: isAdminFieldLevel,
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sourcePage',
      type: 'text',
      label: '来源页面',
      access: {
        create: () => false,
        update: isAdminFieldLevel,
      },
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || typeof data !== 'object') return data

        return {
          ...data,
          status: data.status || 'new',
          sourcePage: data.sourcePage || '/contact',
        }
      },
    ],
  },
  timestamps: true,
}
