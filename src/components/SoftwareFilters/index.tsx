'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback } from 'react'

import { cn } from '@/utilities/ui'

type FilterOption = { label: string; value: string }

export const SoftwareFilters: React.FC<{
  categories: FilterOption[]
  platforms: FilterOption[]
}> = ({ categories, platforms }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get('category') ?? ''
  const activePlatform = searchParams.get('platform') ?? ''

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value) params.set(key, value)
      else params.delete(key)

      params.delete('page')

      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const renderGroup = (title: string, key: string, options: FilterOption[], active: string) => (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-medium text-muted-foreground">{title}</span>
      <button
        type="button"
        onClick={() => setParam(key, '')}
        className={cn(
          'rounded-full border px-3 py-1 text-sm transition-colors',
          !active
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border hover:bg-accent',
        )}
      >
        全部
      </button>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setParam(key, option.value)}
          className={cn(
            'rounded-full border px-3 py-1 text-sm transition-colors',
            active === option.value
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border hover:bg-accent',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      {categories.length > 0 && renderGroup('分类', 'category', categories, activeCategory)}
      {renderGroup('平台', 'platform', platforms, activePlatform)}
    </div>
  )
}
