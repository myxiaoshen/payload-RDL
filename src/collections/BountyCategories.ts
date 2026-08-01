import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'
import { slugFieldZh } from '../fields/slug'

/** 悬赏需求分类（求资源/求教程/求方案/求模板等），与其它分类相互独立。 */
export const BountyCategories: CollectionConfig = {
  slug: 'bounty-categories',
  labels: {
    singular: '悬赏分类',
    plural: '悬赏分类',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: anyone,
    update: isAdmin,
  },
  admin: {
    group: '任务悬赏',
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
