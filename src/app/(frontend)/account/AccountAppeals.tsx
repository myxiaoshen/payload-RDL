'use client'

import React from 'react'

import { ListShell } from './ListShell'
import { usePaginatedList } from './usePaginatedList'

type AppealDoc = {
  id: number | string
  type: 'order' | 'bounty'
  status?: string | null
  refundAmount?: number | null
  reviewNote?: string | null
  createdAt: string
  order?:
    | { id: number | string; resourceTitle?: string | null; price?: number | null }
    | number
    | string
    | null
  bounty?:
    { id: number | string; title?: string | null; reward?: number | null } | number | string | null
}

const STATUS_LABEL: Record<string, string> = {
  pending: '待处理',
  approved: '已批准',
  rejected: '已驳回',
}

export const AccountAppeals: React.FC = () => {
  const { docs, page, totalPages, totalDocs, loading, setPage } = usePaginatedList<AppealDoc>({
    query: '/api/appeals?depth=1&sort=-createdAt',
  })

  return (
    <ListShell
      loading={loading}
      empty={docs.length === 0}
      emptyText="还没有申诉记录。"
      page={page}
      totalPages={totalPages}
      totalDocs={totalDocs}
      onPageChange={setPage}
    >
      {docs.map((a) => {
        const order = a.order && typeof a.order === 'object' ? a.order : null
        const bounty = a.bounty && typeof a.bounty === 'object' ? a.bounty : null
        const title =
          a.type === 'order'
            ? order?.resourceTitle || `订单 #${order?.id ?? ''}`
            : bounty?.title || `悬赏 #${bounty?.id ?? ''}`
        const status = a.status ?? 'pending'

        return (
          <li key={String(a.id)} className="flex flex-col gap-1 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <span className="min-w-0 truncate">
                <span className="mr-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {STATUS_LABEL[status] ?? status}
                </span>
                <span className="mr-2 text-xs text-muted-foreground">
                  {a.type === 'order' ? '订单' : '悬赏'}
                </span>
                {title}
              </span>
              <span className="shrink-0 text-sm text-muted-foreground">
                {a.refundAmount != null ? `退 ${a.refundAmount} Coin · ` : ''}
                {new Date(a.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
            {a.reviewNote ? (
              <p className="text-sm text-muted-foreground">处理说明：{a.reviewNote}</p>
            ) : null}
          </li>
        )
      })}
    </ListShell>
  )
}
