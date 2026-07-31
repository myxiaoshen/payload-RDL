import type { Field } from 'payload'

/**
 * Extra fields stored on each `search` index record so the frontend results page
 * can render a rich card (title / description / image / category) and build the
 * correct href without a second query.
 */
export const searchFields: Field[] = [
  {
    name: 'slug',
    type: 'text',
    index: true,
    admin: {
      readOnly: true,
    },
  },
  {
    name: 'meta',
    label: 'Meta',
    type: 'group',
    index: true,
    admin: {
      readOnly: true,
    },
    fields: [
      {
        type: 'text',
        name: 'title',
        label: '标题',
      },
      {
        type: 'text',
        name: 'description',
        label: '描述',
      },
      {
        name: 'image',
        label: '封面',
        type: 'upload',
        relationTo: 'media',
      },
    ],
  },
  {
    label: '分类',
    name: 'categories',
    type: 'array',
    admin: {
      readOnly: true,
    },
    fields: [
      {
        name: 'relationTo',
        type: 'text',
      },
      {
        name: 'title',
        type: 'text',
      },
    ],
  },
]
