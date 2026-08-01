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

type CommentDoc = {
  id: number | string
  content: string
  status?: string | null
  relatedTo: PolymorphicValue
  createdAt: string
}

const hrefFor = (p: PolymorphicValue): { href: string; title: string } => {
  const base = p.relationTo === 'software' ? '/software' : '/posts'
  if (typeof p.value === 'object' && p.value !== null) {
    return { href: `${base}/${p.value.slug ?? ''}`, title: p.value.title || '未命名' }
  }
  return { href: base, title: '未命名' }
}

const statusLabel = (s?: string | null) =>
  s === 'approved' ? '已通过' : s === 'spam' ? '已屏蔽' : '待审核'

export const AccountComments: React.FC = () => {
  const { docs, page, totalPages, totalDocs, loading, setPage, removeDoc } =
    usePaginatedList<CommentDoc>({ query: '/api/comments?depth=1&sort=-createdAt' })

  const remove = async (id: number | string) => {
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) removeDoc(id)
  }

  return (
    <ListShell
      loading={loading}
      empty={docs.length === 0}
      emptyText="还没有发表评论。"
      page={page}
      totalPages={totalPages}
      totalDocs={totalDocs}
      onPageChange={setPage}
    >
      {docs.map((c) => {
        const { href, title } = hrefFor(c.relatedTo)
        return (
          <li key={String(c.id)} className="flex items-start justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm">{c.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                于{' '}
                <Link href={href} className="hover:text-primary">
                  {title}
                </Link>{' '}
                · {statusLabel(c.status)} · {new Date(c.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => remove(c.id)}>
              删除
            </Button>
          </li>
        )
      })}
    </ListShell>
  )
}
