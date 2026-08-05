'use client'

import Link from 'next/link'
import React, { useState } from 'react'

import { AppealForm } from '@/components/Appeals/AppealForm'
import { Button } from '@/components/ui/button'
import { ListShell } from './ListShell'
import { usePaginatedList } from './usePaginatedList'

type OrderDoc = {
  id: number | string
  price: number
  status?: string | null
  createdAt: string
  resourceTitle?: string | null
  resource?: { id: number | string; title?: string | null; slug?: string | null } | number | string
}

export const AccountOrders: React.FC = () => {
  const { docs, page, totalPages, totalDocs, loading, setPage } = usePaginatedList<OrderDoc>({
    query: '/api/orders?depth=1&sort=-createdAt',
  })
  const [appealingId, setAppealingId] = useState<string | null>(null)

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
        const canAppeal = !o.status || o.status === 'paid'
        const isOpen = appealingId === String(o.id)

        return (
          <li key={String(o.id)} className="flex flex-col gap-3 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {slug ? (
                <Link href={`/market/${slug}`} className="min-w-0 truncate hover:text-primary">
                  {title}
                </Link>
              ) : (
                <span className="min-w-0 truncate">{title}</span>
              )}
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  -{o.price} Coin · {new Date(o.createdAt).toLocaleDateString('zh-CN')}
                </span>
                {canAppeal && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setAppealingId(isOpen ? null : String(o.id))}
                  >
                    {isOpen ? '收起' : '申诉'}
                  </Button>
                )}
              </div>
            </div>
            {isOpen && (
              <AppealForm
                type="order"
                targetId={o.id}
                targetLabel={`订单：${title}（${o.price} Coin）`}
                onClose={() => setAppealingId(null)}
              />
            )}
          </li>
        )
      })}
    </ListShell>
  )
}
