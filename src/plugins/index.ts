import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'

import { Page, Post, Software } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { searchFields } from '@/search/fieldOverrides'

const generateTitle: GenerateTitle<Post | Page | Software> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Website Template` : 'Payload Website Template'
}

const generateURL: GenerateURL<Post | Page | Software> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  searchPlugin({
    collections: ['posts', 'software'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      slug: 'search',
      labels: {
        singular: '搜索索引',
        plural: '搜索索引',
      },
      admin: {
        group: '系统',
      },
      fields: ({ defaultFields }) => [...defaultFields, ...searchFields],
    },
  }),
]
