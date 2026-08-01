'use client'

import React from 'react'

import { ListShell } from './ListShell'
import { usePaginatedList } from './usePaginatedList'

type ResourceDoc = {
  id: number | string
  title?: string | null
  slug?: string | null
  price: number
  salesCount?: number | null
  status?: string | null
}

const statusLabel = (s?: string | null) =>
  s === 'approved' ? '已上架' : s === 'rejected' ? '已拒绝' : '待审核'

type Props = { userId: string }

export const AccountResources: React.FC<Props> = ({ userId }) => {
  const { docs, page, totalPages, totalDocs, loading, setPage } = usePaginatedList<ResourceDoc>({
    query: `/api/market-resources?depth=0&sort=-createdAt&where[author][equals]=${userId}`,
  })

  return (
    <ListShell
      loading={loading}
      empty={docs.length === 0}
      emptyText="还没有发布资源。"
      page={page}
      totalPages={totalPages}
      totalDocs={totalDocs}
      onPageChange={setPage}
    >
      {docs.map((r) => (
        <li key={String(r.id)} className="flex items-center justify-between gap-4 px-4 py-3">
          <span className="min-w-0 truncate">
            <span className="mr-2 text-xs text-muted-foreground">{statusLabel(r.status)}</span>
            {r.title || '未命名'}
          </span>
          <span className="shrink-0 text-sm text-muted-foreground">
            {r.price} Coin · 销量 {r.salesCount ?? 0}
          </span>
        </li>
      ))}
    </ListShell>
  )
}
