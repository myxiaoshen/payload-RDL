'use client'

import Link from 'next/link'
import React from 'react'

import { ListShell } from './ListShell'
import { usePaginatedList } from './usePaginatedList'

type OrderDoc = {
  id: number | string
  price: number
  createdAt: string
  resourceTitle?: string | null
  resource?: { id: number | string; title?: string | null; slug?: string | null } | number | string
}

export const AccountOrders: React.FC = () => {
  const { docs, page, totalPages, totalDocs, loading, setPage } = usePaginatedList<OrderDoc>({
    query: '/api/orders?depth=1&sort=-createdAt',
  })

  return (
    <ListShell
      loading={loading}
      empty={docs.length === 0}
      emptyText="还没有购买记录。"
      page={page}
      totalPages={totalPages}
      totalDocs={totalDocs}
      onPageChange={setPage}
    >
      {docs.map((o) => {
        const r = o.resource
        const title = (r && typeof r === 'object' ? r.title : null) || o.resourceTitle || '资源已下架'
        const slug = r && typeof r === 'object' ? r.slug : undefined
        return (
          <li key={String(o.id)} className="flex items-center justify-between gap-4 px-4 py-3">
            {slug ? (
              <Link href={`/market/${slug}`} className="min-w-0 truncate hover:text-primary">
                {title}
              </Link>
            ) : (
              <span className="min-w-0 truncate">{title}</span>
            )}
            <span className="shrink-0 text-sm text-muted-foreground">
              -{o.price} Coin · {new Date(o.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </li>
        )
      })}
    </ListShell>
  )
}
