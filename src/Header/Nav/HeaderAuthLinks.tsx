'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { NotificationBell } from '@/components/Notifications/NotificationBell'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type AvatarMedia = {
  url?: string | null
  externalUrl?: string | null
  updatedAt?: string | null
}

type MeUser = {
  id: string
  email: string
  name?: string | null
  role?: string | null
  avatar?: number | AvatarMedia | null
} | null

const resolveAvatarUrl = (avatar?: number | AvatarMedia | null): string => {
  if (!avatar || typeof avatar !== 'object') return ''

  if (avatar.externalUrl) return avatar.externalUrl

  return getMediaUrl(avatar.url, avatar.updatedAt)
}

export const HeaderAuthLinks: React.FC = () => {
  const [user, setUser] = useState<MeUser>(null)
  const [loaded, setLoaded] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false

    fetch('/api/users/me?depth=1', { credentials: 'include' })
      .then((res) => res.json())
      .then(async (data) => {
        let nextUser: MeUser = data?.user ?? null

        if (nextUser?.id && nextUser.avatar && typeof nextUser.avatar !== 'object') {
          try {
            const hydrated = await fetch(`/api/users/${nextUser.id}?depth=1`, {
              credentials: 'include',
            }).then((res) => res.json())

            if (hydrated?.avatar && typeof hydrated.avatar === 'object') {
              nextUser = { ...nextUser, avatar: hydrated.avatar }
            }
          } catch {
            // Ignore hydration errors and keep minimal user payload.
          }
        }

        if (!cancelled) {
          setUser(nextUser)
          setLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [pathname])

  if (!loaded) return <span className="w-14 sm:w-28" />

  if (user) {
    const avatarUrl = resolveAvatarUrl(user.avatar)
    const initial = (user.name || user.email || '?').charAt(0).toUpperCase()

    return (
      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationBell />
        <Link href="/account" className="flex items-center gap-2 text-sm hover:text-primary">
          <span className="inline-flex size-7 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="用户头像" className="size-full object-cover" />
            ) : (
              initial
            )}
          </span>
          <span className="hidden sm:inline">我的账户</span>
        </Link>
      </div>
    )
  }

  return (
    <>
      <Link href="/login" className="text-sm hover:text-primary">
        登录
      </Link>
      <Link href="/register" className="text-sm hover:text-primary">
        注册
      </Link>
    </>
  )
}
