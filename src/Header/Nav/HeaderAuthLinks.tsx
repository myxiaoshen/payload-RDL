'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { NotificationBell } from '@/components/Notifications/NotificationBell'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

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

const MENU_LINK_CLASS =
  'block w-full px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted hover:text-primary'

const resolveAvatarUrl = (avatar?: number | AvatarMedia | null): string => {
  if (!avatar || typeof avatar !== 'object') return ''

  if (avatar.externalUrl) return avatar.externalUrl

  return getMediaUrl(avatar.url, avatar.updatedAt)
}

export const HeaderAuthLinks: React.FC = () => {
  const [user, setUser] = useState<MeUser>(null)
  const [loaded, setLoaded] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

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

  const handleLogout = async () => {
    if (loggingOut) return

    setLoggingOut(true)

    try {
      await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
      setUser(null)
      router.push('/login')
      router.refresh()
    } finally {
      setLoggingOut(false)
    }
  }

  if (!loaded) return <span className="w-14 sm:w-28" />

  if (user) {
    const avatarUrl = resolveAvatarUrl(user.avatar)
    const initial = (user.name || user.email || '?').charAt(0).toUpperCase()

    return (
      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationBell />
        <div className="group relative">
          <Link
            href="/account"
            className="flex items-center gap-2 text-sm hover:text-primary"
            aria-haspopup="menu"
          >
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

          {/* Keep a hover bridge so the menu stays open while the pointer moves down. */}
          <div
            className={cn(
              'invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition-all duration-200 ease-out',
              'translate-y-[-6px]',
              'group-hover:visible group-hover:translate-y-0 group-hover:opacity-100',
              'group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100',
            )}
            role="menu"
            aria-label="账户菜单"
          >
            <div className="min-w-[9.5rem] overflow-hidden rounded-md border border-border bg-card py-1 shadow-md">
              <Link href="/account?tab=orders" className={MENU_LINK_CLASS} role="menuitem">
                我的订单
              </Link>
              <Link href="/account?tab=favorites" className={MENU_LINK_CLASS} role="menuitem">
                我的收藏
              </Link>
              <button
                type="button"
                className={cn(MENU_LINK_CLASS, 'text-destructive hover:text-destructive')}
                role="menuitem"
                disabled={loggingOut}
                onClick={handleLogout}
              >
                {loggingOut ? '注销中…' : '注销'}
              </button>
            </div>
          </div>
        </div>
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
