import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'
import { slugFieldZh } from '../fields/slug'

/** 交易市场商品分类，与文章分类、软件分类相互独立。 */
export const MarketCategories: CollectionConfig = {
  slug: 'market-categories',
  labels: {
    singular: '商品分类',
    plural: '商品分类',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: anyone,
    update: isAdmin,
  },
  admin: {
    group: '交易市场',
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
