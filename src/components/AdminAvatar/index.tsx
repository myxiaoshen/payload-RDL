'use client'

import { useAuth } from '@payloadcms/ui'
import React, { useEffect, useMemo, useState } from 'react'

type AvatarMedia = {
  url?: string | null
  externalUrl?: string | null
}

type AdminUser = {
  email?: string | null
  name?: string | null
  avatar?: number | AvatarMedia | null
}

const readAvatarUrl = (avatar?: number | AvatarMedia | null): string => {
  if (!avatar || typeof avatar !== 'object') return ''
  return avatar.externalUrl || avatar.url || ''
}

const fallbackInitial = (user?: AdminUser | null) =>
  (user?.name || user?.email || '?').charAt(0).toUpperCase()

const AdminAvatar: React.FC = () => {
  const { user } = useAuth<AdminUser>()
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    let cancelled = false

    const currentFromAuth = readAvatarUrl(user?.avatar)
    if (currentFromAuth) {
      setAvatarUrl(currentFromAuth)
      return () => {
        cancelled = true
      }
    }

    fetch('/api/users/me?depth=1', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const url = readAvatarUrl(data?.user?.avatar)
        if (!cancelled) setAvatarUrl(url)
      })
      .catch(() => {
        if (!cancelled) setAvatarUrl('')
      })

    return () => {
      cancelled = true
    }
  }, [user?.avatar])

  const initial = useMemo(() => fallbackInitial(user), [user])

  return (
    <span
      style={{
        alignItems: 'center',
        background: 'var(--theme-elevation-150)',
        borderRadius: '9999px',
        display: 'inline-flex',
        height: 25,
        justifyContent: 'center',
        overflow: 'hidden',
        width: 25,
      }}
      aria-label="用户头像"
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt="用户头像"
          style={{ display: 'block', height: '100%', objectFit: 'cover', width: '100%' }}
        />
      ) : (
        <span style={{ color: 'var(--theme-elevation-700)', fontSize: 11, fontWeight: 700 }}>
          {initial}
        </span>
      )}
    </span>
  )
}

export default AdminAvatar
