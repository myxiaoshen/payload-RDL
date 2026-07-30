'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import { Button } from '@/components/ui/button'

export const QueryPagination: React.FC<{ page: number; totalPages: number }> = ({
  page,
  totalPages,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const goTo = (next: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next > 1) params.set('page', String(next))
    else params.delete('page')

    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goTo(page - 1)}>
        <ChevronLeft />
        上一页
      </Button>

      <span className="text-sm text-muted-foreground">
        第 {page} / {totalPages} 页
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => goTo(page + 1)}
      >
        下一页
        <ChevronRight />
      </Button>
    </div>
  )
}
