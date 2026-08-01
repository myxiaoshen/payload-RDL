'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'

type Props = {
  children: React.ReactNode
  loading: boolean
  empty: boolean
  emptyText: string
  page: number
  totalPages: number
  totalDocs: number
  onPageChange: (page: number) => void
  /** 列表上方的补充说明，如累计收益 */
  summary?: React.ReactNode
}

/** 个人中心各列表的统一外壳：加载态、空态、条数与翻页。 */
export const ListShell: React.FC<Props> = ({
  children,
  loading,
  empty,
  emptyText,
  page,
  totalPages,
  totalDocs,
  onPageChange,
  summary,
}) => (
  <div>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
      <span>共 {totalDocs} 条</span>
      {summary}
    </div>

    {loading ? (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    ) : empty ? (
      <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    ) : (
      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {children}
      </ul>
    )}

    {totalPages > 1 && (
      <div className="mt-4 flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          上一页
        </Button>
        <span className="text-sm text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
        >
          下一页
          <ChevronRight className="size-4" />
        </Button>
      </div>
    )}
  </div>
)
