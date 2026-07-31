import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'
import { slugFieldZh } from '../fields/slug'

/** 软件库专用分类，与文章分类（categories）完全独立，避免后台选择时混淆。 */
export const SoftwareCategories: CollectionConfig = {
  slug: 'software-categories',
  labels: {
    singular: '软件分类',
    plural: '软件分类',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: anyone,
    update: isAdmin,
  },
  admin: {
    group: '软件库',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '分类名称',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: '分类说明',
      maxLength: 200,
    },
    slugFieldZh({ position: undefined }),
  ],
}
