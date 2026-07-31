import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import type { Search } from '@/payload-types'

import { Media } from '@/components/Media'
import { SearchBar } from '@/components/Search/SearchBar'

export const dynamic = 'force-dynamic'

type Args = {
  searchParams: Promise<{ q?: string }>
}

const hrefForResult = (doc: Search): string => {
  const relationTo = doc.doc?.relationTo
  const slug = doc.slug
  if (!slug) return '/'
  return relationTo === 'software' ? `/software/${slug}` : `/posts/${slug}`
}

export default async function SearchPage({ searchParams }: Args) {
  const { q = '' } = await searchParams
  const query = q.trim()

  let results: Search[] = []

  if (query) {
    const payload = await getPayload({ config: configPromise })
    const found = await payload.find({
      collection: 'search',
      depth: 1,
      limit: 50,
      where: {
        or: [
          { title: { like: query } },
          { 'meta.title': { like: query } },
          { 'meta.description': { like: query } },
          { slug: { like: query } },
        ],
      },
    })
    results = found.docs as Search[]
  }

  return (
    <div className="container max-w-3xl py-24">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">站内搜索</h1>

      <SearchBar className="mb-10" />

      {query && (
        <p className="mb-6 text-sm text-muted-foreground">
          搜索 “{query}” ，共找到 {results.length} 条结果
        </p>
      )}

      {query && results.length === 0 && (
        <p className="text-muted-foreground">没有找到相关内容，换个关键词试试。</p>
      )}

      <ul className="flex flex-col gap-6">
        {results.map((doc) => {
          const image =
            doc.meta?.image && typeof doc.meta.image === 'object' ? doc.meta.image : null
          return (
            <li key={doc.id}>
              <Link
                href={hrefForResult(doc)}
                className="group flex gap-4 rounded-lg border border-border p-4 transition-colors hover:border-primary"
              >
                <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded bg-muted sm:block">
                  {image && (
                    <Media resource={image} fill imgClassName="object-cover" size="112px" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-xs uppercase text-muted-foreground">
                    {doc.doc?.relationTo === 'software' ? '软件' : '文章'}
                  </p>
                  <h2 className="truncate text-lg font-semibold group-hover:text-primary">
                    {doc.meta?.title || doc.title}
                  </h2>
                  {doc.meta?.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {doc.meta.description}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export const metadata: Metadata = {
  title: '站内搜索',
}
