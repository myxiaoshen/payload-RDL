'use client'

import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { ListShell } from './ListShell'
import { usePaginatedList } from './usePaginatedList'

type PolymorphicValue = {
  relationTo: 'posts' | 'software'
  value: { id: number | string; title?: string | null; slug?: string | null } | number | string
}

type FavoriteDoc = { id: number | string; doc: PolymorphicValue }

const hrefFor = (p: PolymorphicValue): { href: string; title: string } => {
  const base = p.relationTo === 'software' ? '/software' : '/posts'
  if (typeof p.value === 'object' && p.value !== null) {
    return { href: `${base}/${p.value.slug ?? ''}`, title: p.value.title || '未命名' }
  }
  return { href: base, title: '未命名' }
}

export const AccountFavorites: React.FC = () => {
  const { docs, page, totalPages, totalDocs, loading, setPage, removeDoc } =
    usePaginatedList<FavoriteDoc>({ query: '/api/favorites?depth=1&sort=-createdAt' })

  const remove = async (id: number | string) => {
    const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) removeDoc(id)
  }

  return (
    <ListShell
      loading={loading}
      empty={docs.length === 0}
      emptyText="还没有收藏任何内容。"
      page={page}
      totalPages={totalPages}
      totalDocs={totalDocs}
      onPageChange={setPage}
    >
      {docs.map((f) => {
        const { href, title } = hrefFor(f.doc)
        return (
          <li key={String(f.id)} className="flex items-center justify-between gap-4 px-4 py-3">
            <Link href={href} className="min-w-0 truncate hover:text-primary">
              <span className="mr-2 text-xs text-muted-foreground">
                {f.doc.relationTo === 'software' ? '软件' : '文章'}
              </span>
              {title}
            </Link>
            <Button variant="outline" size="sm" onClick={() => remove(f.id)}>
              取消
            </Button>
          </li>
        )
      })}
    </ListShell>
  )
}
