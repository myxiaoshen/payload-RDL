'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utilities/ui'

type SortOption = { label: string; value: string }
type CategoryOption = { label: string; value: string }

const SORTS: SortOption[] = [
  { label: '最新', value: '-createdAt' },
  { label: '销量', value: '-salesCount' },
  { label: '价格从低到高', value: 'price' },
  { label: '价格从高到低', value: '-price' },
]

export const MarketFilters: React.FC<{ categories?: CategoryOption[] }> = ({ categories = [] }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeSort = searchParams.get('sort') || '-createdAt'
  const activeCategory = searchParams.get('category') ?? ''

  const pushParams = useCallback(
    (params: URLSearchParams) => {
      params.delete('page')
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router],
  )

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      pushParams(params)
    },
    [pushParams, searchParams],
  )

  const setSort = useCallback(
    (value: string) => {
      setParam('sort', value)
    },
    [setParam],
  )

  const onPriceSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = new FormData(e.currentTarget)
      const min = String(form.get('minPrice') || '').trim()
      const max = String(form.get('maxPrice') || '').trim()
      const params = new URLSearchParams(searchParams.toString())

      if (min) params.set('minPrice', min)
      else params.delete('minPrice')
      if (max) params.set('maxPrice', max)
      else params.delete('maxPrice')

      pushParams(params)
    },
    [pushParams, searchParams],
  )

  return (
    <div className="flex flex-col gap-4">
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-medium text-muted-foreground">分类</span>
          <button
            type="button"
            onClick={() => setParam('category', '')}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              !activeCategory
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:bg-accent',
            )}
          >
            全部
          </button>
          {categories.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setParam('category', c.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-sm transition-colors',
                activeCategory === c.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-accent',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-muted-foreground">排序</span>
        {SORTS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setSort(s.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              activeSort === s.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:bg-accent',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={onPriceSubmit} className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-muted-foreground">价格区间</span>
        <Input
          name="minPrice"
          type="number"
          min={0}
          placeholder="最低"
          defaultValue={searchParams.get('minPrice') ?? ''}
          className="h-9 w-24"
        />
        <span className="text-muted-foreground">—</span>
        <Input
          name="maxPrice"
          type="number"
          min={0}
          placeholder="最高"
          defaultValue={searchParams.get('maxPrice') ?? ''}
          className="h-9 w-24"
        />
        <Button type="submit" size="sm" variant="outline">
          筛选
        </Button>
      </form>
    </div>
  )
}
