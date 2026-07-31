'use client'

import React, { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'

type MeUser = { id: number | string } | null

export const FavoriteButton: React.FC<{
  relationTo: 'posts' | 'software'
  docId: number | string
}> = ({ relationTo, docId }) => {
  const [user, setUser] = useState<MeUser>(null)
  const [ready, setReady] = useState(false)
  const [favoriteId, setFavoriteId] = useState<number | string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        const me = await fetch('/api/users/me', { credentials: 'include' }).then((r) => r.json())
        if (cancelled) return
        const u = me?.user ?? null
        setUser(u)
        if (u) {
          const qs = new URLSearchParams()
          qs.set('where[doc.value][equals]', String(docId))
          qs.set('where[doc.relationTo][equals]', relationTo)
          qs.set('limit', '1')
          qs.set('depth', '0')
          const fav = await fetch(`/api/favorites?${qs.toString()}`, {
            credentials: 'include',
          }).then((r) => r.json())
          if (!cancelled) setFavoriteId(fav?.docs?.[0]?.id ?? null)
        }
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    void init()
    return () => {
      cancelled = true
    }
  }, [docId, relationTo])

  const toggle = async () => {
    if (!user || busy) return
    setBusy(true)
    try {
      if (favoriteId != null) {
        const res = await fetch(`/api/favorites/${favoriteId}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        if (res.ok) setFavoriteId(null)
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doc: { relationTo, value: docId } }),
        })
        const data = await res.json()
        if (res.ok) setFavoriteId(data?.doc?.id ?? null)
      }
    } finally {
      setBusy(false)
    }
  }

  if (!ready) return null

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm">
        <a href="/login">
          <Heart className="mr-1 size-4" /> 登录后收藏
        </a>
      </Button>
    )
  }

  const active = favoriteId != null

  return (
    <Button variant={active ? 'default' : 'outline'} size="sm" disabled={busy} onClick={toggle}>
      <Heart className={cn('mr-1 size-4', active && 'fill-current')} />
      {active ? '已收藏' : '收藏'}
    </Button>
  )
}
