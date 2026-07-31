'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { NotificationBell } from '@/components/Notifications/NotificationBell'

type MeUser = { id: string; email: string; role?: string | null } | null

export const HeaderAuthLinks: React.FC = () => {
  const [user, setUser] = useState<MeUser>(null)
  const [loaded, setLoaded] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false

    fetch('/api/users/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setUser(data?.user ?? null)
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

  if (!loaded) return <span className="w-16" />

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <NotificationBell />
        <Link href="/account" className="text-sm hover:text-primary">
          我的账户
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
