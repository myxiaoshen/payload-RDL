'use client'

import { Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  placeholder?: string
}

/** 资源板块通用模糊搜索框，搜索词写入 `?q=` 由服务端做 like 查询。 */
export const ResourceSearch: React.FC<Props> = ({ placeholder = '搜索标题关键字…' }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeQuery = searchParams.get('q') ?? ''

  const [value, setValue] = useState(activeQuery)

  useEffect(() => {
    setValue(activeQuery)
  }, [activeQuery])

  const submit = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (next.trim()) params.set('q', next.trim())
    else params.delete('q')
    params.delete('page')

    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit(value)
      }}
      className="flex w-full max-w-md items-center gap-2"
      role="search"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="搜索"
          className="h-9 pl-9 pr-9"
        />
        {value && (
          <button
            type="button"
            aria-label="清空搜索"
            onClick={() => {
              setValue('')
              submit('')
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Button type="submit" size="sm" variant="outline">
        搜索
      </Button>
    </form>
  )
}
