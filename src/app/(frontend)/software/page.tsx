import type { Metadata } from 'next/types'
import type { Where } from 'payload'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { QueryPagination } from '@/components/QueryPagination'
import { SoftwareCard } from '@/components/SoftwareCard'
import { SoftwareFilters } from '@/components/SoftwareFilters'
import { platformLabels } from '@/utilities/platforms'

export const dynamic = 'force-dynamic'

const PER_PAGE = 12

type Args = {
  searchParams: Promise<{ category?: string; platform?: string; page?: string }>
}

export default async function SoftwarePage({ searchParams }: Args) {
  const { category, platform, page } = await searchParams
  const payload = await getPayload({ config: configPromise })

  const currentPage = Number(page) > 0 ? Number(page) : 1

  const where: Where = {}
  if (category) where.categories = { in: [category] }
  if (platform && platform in platformLabels) where.platform = { in: [platform] }

  const [software, categories] = await Promise.all([
    payload.find({
      collection: 'software',
      depth: 1,
      limit: PER_PAGE,
      page: currentPage,
      overrideAccess: false,
      sort: ['-featured', '-publishedAt'],
      where,
    }),
    payload.find({
      collection: 'categories',
      depth: 0,
      limit: 100,
      sort: 'title',
      select: { title: true },
    }),
  ])

  return (
    <div className="container py-24">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">软件下载</h1>
        <p className="mt-2 text-muted-foreground">共 {software.totalDocs} 款软件，登录后即可下载</p>
      </header>

      <div className="mb-10">
        <SoftwareFilters
          categories={categories.docs.map((c) => ({ label: c.title, value: String(c.id) }))}
          platforms={Object.entries(platformLabels).map(([value, label]) => ({ label, value }))}
        />
      </div>

      {software.docs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
          没有找到符合条件的软件
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {software.docs.map((doc) => (
            <SoftwareCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      {software.totalPages > 1 && software.page && (
        <div className="mt-16">
          <QueryPagination page={software.page} totalPages={software.totalPages} />
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: '软件下载',
    description: '浏览并下载全部软件资源',
  }
}
