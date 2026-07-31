'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const SearchBar: React.FC<{ className?: string }> = ({ className }) => {
  const router = useRouter()
  const params = useSearchParams()
  const [value, setValue] = useState(params.get('q') ?? '')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <form onSubmit={onSubmit} className={className} role="search">
      <div className="flex gap-2">
        <Input
          type="search"
          placeholder="搜索文章、软件…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="站内搜索"
        />
        <Button type="submit">搜索</Button>
      </div>
    </form>
  )
}
