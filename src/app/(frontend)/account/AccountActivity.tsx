'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

type PolymorphicValue = {
  relationTo: 'posts' | 'software'
  value: { id: number | string; title?: string | null; slug?: string | null } | number | string
}

type FavoriteDoc = { id: number | string; doc: PolymorphicValue }
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

export const AccountActivity: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteDoc[]>([])
  const [comments, setComments] = useState<CommentDoc[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [favRes, comRes] = await Promise.all([
        fetch('/api/favorites?depth=1&limit=100&sort=-createdAt', {
          credentials: 'include',
        }).then((r) => r.json()),
        fetch('/api/comments?depth=1&limit=100&sort=-createdAt', {
          credentials: 'include',
        }).then((r) => r.json()),
      ])
      setFavorites(favRes?.docs ?? [])
      setComments(comRes?.docs ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const removeFavorite = async (id: number | string) => {
    const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) setFavorites((prev) => prev.filter((f) => f.id !== id))
  }

  const removeComment = async (id: number | string) => {
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) setComments((prev) => prev.filter((c) => c.id !== id))
  }

  if (loading) return <p className="text-sm text-muted-foreground">加载中…</p>

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-4 text-xl font-semibold">我的收藏</h2>
        {favorites.length === 0 ? (
          <p className="text-sm text-muted-foreground">还没有收藏任何内容。</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {favorites.map((f) => {
              const { href, title } = hrefFor(f.doc)
              return (
                <li
                  key={String(f.id)}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <Link href={href} className="min-w-0 truncate hover:text-primary">
                    <span className="mr-2 text-xs text-muted-foreground">
                      {f.doc.relationTo === 'software' ? '软件' : '文章'}
                    </span>
                    {title}
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => removeFavorite(f.id)}>
                    取消
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">我的评论</h2>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">还没有发表评论。</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {comments.map((c) => {
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
                      · {statusLabel(c.status)} ·{' '}
                      {new Date(c.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => removeComment(c.id)}>
                    删除
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
