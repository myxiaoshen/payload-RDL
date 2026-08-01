'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utilities/ui'

type Option = { label: string; value: string }

const SORTS: Option[] = [
  { label: '最新', value: '-createdAt' },
  { label: '悬赏最高', value: '-reward' },
  { label: '悬赏最低', value: 'reward' },
  { label: '方案最多', value: '-submissionCount' },
]

const STATUSES: Option[] = [
  { label: '进行中', value: 'open' },
  { label: '已完成', value: 'fulfilled' },
  { label: '全部', value: 'all' },
]

export const BountyFilters: React.FC<{ categories?: Option[] }> = ({ categories = [] }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeSort = searchParams.get('sort') || '-createdAt'
  const activeCategory = searchParams.get('category') ?? ''
  const activeStatus = searchParams.get('status') || 'open'

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

  const onRewardSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = new FormData(e.currentTarget)
      const min = String(form.get('minReward') || '').trim()
      const max = String(form.get('maxReward') || '').trim()
      const params = new URLSearchParams(searchParams.toString())

      if (min) params.set('minReward', min)
      else params.delete('minReward')
      if (max) params.set('maxReward', max)
      else params.delete('maxReward')

      pushParams(params)
    },
    [pushParams, searchParams],
  )

  const pill = (active: boolean) =>
    cn(
      'rounded-full border px-3 py-1 text-sm transition-colors',
      active
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border hover:bg-accent',
    )

  return (
    <div className="flex flex-col gap-4">
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-medium text-muted-foreground">分类</span>
          <button
            type="button"
            onClick={() => setParam('category', '')}
            className={pill(!activeCategory)}
          >
            全部
          </button>
          {categories.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setParam('category', c.value)}
              className={pill(activeCategory === c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-muted-foreground">状态</span>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setParam('status', s.value === 'open' ? '' : s.value)}
            className={pill(activeStatus === s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-muted-foreground">排序</span>
        {SORTS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setParam('sort', s.value)}
            className={pill(activeSort === s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={onRewardSubmit} className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-muted-foreground">悬赏区间</span>
        <Input
          name="minReward"
          type="number"
          min={0}
          placeholder="最低"
          defaultValue={searchParams.get('minReward') ?? ''}
          className="h-9 w-24"
        />
        <span className="text-muted-foreground">—</span>
        <Input
          name="maxReward"
          type="number"
          min={0}
          placeholder="最高"
          defaultValue={searchParams.get('maxReward') ?? ''}
          className="h-9 w-24"
        />
        <Button type="submit" size="sm" variant="outline">
          筛选
        </Button>
      </form>
    </div>
  )
}
