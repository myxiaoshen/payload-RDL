'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, X } from 'lucide-react'

import { cn } from '@/utilities/ui'

type NotificationDoc = {
  id: number | string
  title: string
  message: string
  link?: string | null
  createdAt: string
}

type ReadDoc = { notification: { id: number | string } | number | string }

const readNotificationId = (n: ReadDoc['notification']): string =>
  typeof n === 'object' && n !== null ? String(n.id) : String(n)

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDoc[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState(false)
  const [popup, setPopup] = useState<NotificationDoc | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const [notifRes, readRes] = await Promise.all([
        fetch('/api/notifications?limit=50&sort=-createdAt&depth=0', {
          credentials: 'include',
        }).then((r) => r.json()),
        fetch('/api/notification-reads?limit=500&depth=0', { credentials: 'include' }).then((r) =>
          r.json(),
        ),
      ])
      const notifs: NotificationDoc[] = notifRes?.docs ?? []
      const reads = new Set<string>(
        (readRes?.docs ?? []).map((d: ReadDoc) => readNotificationId(d.notification)),
      )
      setNotifications(notifs)
      setReadIds(reads)

      // 登录后弹窗提醒：本会话只弹一次最新未读
      const firstUnread = notifs.find((n) => !reads.has(String(n.id)))
      if (firstUnread && typeof window !== 'undefined') {
        const key = 'notif-popup-shown'
        if (!sessionStorage.getItem(key)) {
          setPopup(firstUnread)
          sessionStorage.setItem(key, '1')
        }
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const markRead = async (id: number | string) => {
    if (readIds.has(String(id))) return
    setReadIds((prev) => new Set(prev).add(String(id)))
    try {
      await fetch('/api/notification-reads', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification: id }),
      })
    } catch {
      /* ignore */
    }
  }

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !readIds.has(String(n.id)))
    setReadIds(new Set(notifications.map((n) => String(n.id))))
    await Promise.all(unread.map((n) => markRead(n.id)))
  }

  const unreadCount = notifications.filter((n) => !readIds.has(String(n.id))).length

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label={`通知${unreadCount > 0 ? `，${unreadCount} 条未读` : ''}`}
        className="relative flex items-center text-foreground hover:text-primary"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <span className="text-sm font-semibold">通知</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={markAllRead}
              >
                全部已读
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">暂无通知</p>
            ) : (
              notifications.map((n) => {
                const unread = !readIds.has(String(n.id))
                const body = (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-2">
                      {unread && (
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-red-500" />
                      )}
                      <span className={cn('text-sm', unread ? 'font-semibold' : 'font-medium')}>
                        {n.title}
                      </span>
                    </div>
                    <span className="line-clamp-2 pl-4 text-xs text-muted-foreground">
                      {n.message}
                    </span>
                    <span className="pl-4 text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                )
                return (
                  <div
                    key={String(n.id)}
                    className={cn(
                      'block cursor-pointer border-b border-border px-4 py-3 transition-colors hover:bg-muted/50',
                      unread && 'bg-primary/5',
                    )}
                    onClick={() => void markRead(n.id)}
                  >
                    {n.link ? (
                      <Link href={n.link} onClick={() => setOpen(false)}>
                        {body}
                      </Link>
                    ) : (
                      body
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {popup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-xl">
            <div className="mb-2 flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold">{popup.title}</h3>
              <button
                type="button"
                aria-label="关闭"
                onClick={() => setPopup(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{popup.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              {popup.link && (
                <Link
                  href={popup.link}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
                  onClick={() => {
                    void markRead(popup.id)
                    setPopup(null)
                  }}
                >
                  查看
                </Link>
              )}
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                onClick={() => {
                  void markRead(popup.id)
                  setPopup(null)
                }}
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
