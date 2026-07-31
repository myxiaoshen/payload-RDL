import type { Metadata } from 'next/types'
import type { Where } from 'payload'

import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { MarketCard } from '@/components/Market/MarketCard'
import { MarketFilters } from '@/components/Market/MarketFilters'
import { QueryPagination } from '@/components/QueryPagination'
import { ResourceSearch } from '@/components/ResourceSearch'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const PER_PAGE = 12
const ALLOWED_SORTS = new Set(['-createdAt', '-salesCount', 'price', '-price'])

type Args = {
  searchParams: Promise<{
    category?: string
    page?: string
    q?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
  }>
}

export default async function MarketPage({ searchParams }: Args) {
  const { category, page, q, sort, minPrice, maxPrice } = await searchParams
  const payload = await getPayload({ config: configPromise })

  const currentPage = Number(page) > 0 ? Number(page) : 1
  const activeSort = sort && ALLOWED_SORTS.has(sort) ? sort : '-createdAt'
  const keyword = q?.trim()

  const where: Where = { status: { equals: 'approved' } }
  const priceFilter: Record<string, number> = {}
  if (minPrice && !Number.isNaN(Number(minPrice))) priceFilter.greater_than_equal = Number(minPrice)
  if (maxPrice && !Number.isNaN(Number(maxPrice))) priceFilter.less_than_equal = Number(maxPrice)
  if (Object.keys(priceFilter).length > 0) where.price = priceFilter
  if (category) where.category = { equals: category }
  if (keyword) where.title = { like: keyword }

  const [resources, categories] = await Promise.all([
    payload.find({
      collection: 'market-resources',
      depth: 1,
      limit: PER_PAGE,
      page: currentPage,
      overrideAccess: false,
      sort: activeSort,
      where,
    }),
    payload.find({
      collection: 'market-categories',
      depth: 0,
      limit: 100,
      sort: 'title',
      select: { title: true },
    }),
  ])

  return (
    <div className="container py-24">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">资源交易区</h1>
          <p className="mt-2 text-muted-foreground">
            共 {resources.totalDocs} 个资源，使用平台币即可购买
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/market/publish">发布资源</Link>
        </Button>
      </header>

      <div className="mb-10 flex flex-col gap-5">
        <ResourceSearch placeholder="搜索商品标题…" />
        <MarketFilters
          categories={categories.docs.map((c) => ({ label: c.title, value: String(c.id) }))}
        />
      </div>

      {resources.docs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
          没有找到符合条件的资源
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resources.docs.map((doc) => (
            <MarketCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      {resources.totalPages > 1 && resources.page && (
        <div className="mt-16">
          <QueryPagination page={resources.page} totalPages={resources.totalPages} />
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: '资源交易区',
    description: '使用平台币购买用户发布的软件资源',
  }
}
