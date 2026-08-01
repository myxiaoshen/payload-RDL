import type { Metadata } from 'next/types'
import type { Where } from 'payload'

import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { BountyCard } from '@/components/Bounty/BountyCard'
import { BountyFilters } from '@/components/Bounty/BountyFilters'
import { QueryPagination } from '@/components/QueryPagination'
import { ResourceSearch } from '@/components/ResourceSearch'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const PER_PAGE = 12
const ALLOWED_SORTS = new Set(['-createdAt', '-reward', 'reward', '-submissionCount'])
const PUBLIC_STATUSES = ['open', 'fulfilled', 'closed']

type Args = {
  searchParams: Promise<{
    category?: string
    page?: string
    q?: string
    sort?: string
    status?: string
    minReward?: string
    maxReward?: string
  }>
}

export default async function BountyPage({ searchParams }: Args) {
  const { category, page, q, sort, status, minReward, maxReward } = await searchParams
  const payload = await getPayload({ config: configPromise })

  const currentPage = Number(page) > 0 ? Number(page) : 1
  const activeSort = sort && ALLOWED_SORTS.has(sort) ? sort : '-createdAt'
  const keyword = q?.trim()

  const statusFilter: Where =
    status === 'all'
      ? { status: { in: PUBLIC_STATUSES } }
      : status && PUBLIC_STATUSES.includes(status)
        ? { status: { equals: status } }
        : { status: { equals: 'open' } }

  const where: Where = { ...statusFilter }
  const rewardFilter: Record<string, number> = {}
  if (minReward && !Number.isNaN(Number(minReward)))
    rewardFilter.greater_than_equal = Number(minReward)
  if (maxReward && !Number.isNaN(Number(maxReward)))
    rewardFilter.less_than_equal = Number(maxReward)
  if (Object.keys(rewardFilter).length > 0) where.reward = rewardFilter
  if (category) where.category = { equals: category }
  if (keyword) where.title = { like: keyword }

  const [bounties, categories] = await Promise.all([
    payload.find({
      collection: 'bounties',
      depth: 1,
      limit: PER_PAGE,
      page: currentPage,
      overrideAccess: false,
      sort: activeSort,
      where,
    }),
    payload.find({
      collection: 'bounty-categories',
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
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">任务悬赏区</h1>
          <p className="mt-2 text-muted-foreground">
            共 {bounties.totalDocs} 个需求，完成任务即可赚取平台币
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/bounty/publish">发布悬赏</Link>
        </Button>
      </header>

      <div className="mb-10 flex flex-col gap-5">
        <ResourceSearch placeholder="搜索需求标题…" />
        <BountyFilters
          categories={categories.docs.map((c) => ({ label: c.title, value: String(c.id) }))}
        />
      </div>

      {bounties.docs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
          没有找到符合条件的悬赏
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {bounties.docs.map((doc) => (
            <BountyCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      {bounties.totalPages > 1 && bounties.page && (
        <div className="mt-16">
          <QueryPagination page={bounties.page} totalPages={bounties.totalPages} />
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: '任务悬赏区',
    description: '发布需求悬赏平台币，完成他人任务即可赚取平台币',
  }
}
