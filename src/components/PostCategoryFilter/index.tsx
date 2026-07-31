'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback } from 'react'

import { cn } from '@/utilities/ui'

type FilterOption = { label: string; value: string }

export const PostCategoryFilter: React.FC<{ categories: FilterOption[] }> = ({ categories }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const active = searchParams.get('category') ?? ''

  const setCategory = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set('category', value)
      else params.delete('category')
      params.delete('page')
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  if (categories.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setCategory('')}
        className={cn(
          'rounded-full border px-3 py-1 text-sm transition-colors',
          !active
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border hover:bg-accent',
        )}
      >
        全部
      </button>
      {categories.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setCategory(option.value)}
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
}
