'use client'

import { Download, Loader2, Lock } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

import type { User } from '@/payload-types'

import { ROLE_LABEL } from '@/access/roleHierarchy'
import { Button } from '@/components/ui/button'
import { platformLabel } from '@/utilities/platforms'

export type DownloadItem = {
  label: string
  platform?: string | null
  fileSize?: string | null
  requiredRole?: User['role']
  locked?: boolean
}

export const DownloadButtons: React.FC<{
  softwareId: string
  items: DownloadItem[]
}> = ({ softwareId, items }) => {
  const [pending, setPending] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async (fileIndex: number) => {
    setPending(fileIndex)
    setError(null)

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ softwareId, fileIndex }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error ?? '下载失败，请稍后重试')
        return
      }

      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        const requiredRole = item.requiredRole ?? 'user'
        const showBadge = requiredRole !== 'user'

        return (
          <div
            key={index}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{item.label}</p>
                {showBadge && (
                  <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                    {ROLE_LABEL[requiredRole]}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {[platformLabel(item.platform), item.fileSize].filter(Boolean).join(' · ')}
              </p>
            </div>

            {item.locked ? (
              <Button asChild size="sm" variant="outline">
                <Link href="/vip" aria-label={`升级以下载 ${item.label}`}>
                  <Lock />
                  升级
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={pending !== null}
                onClick={() => handleDownload(index)}
                aria-label={`下载 ${item.label}`}
              >
                {pending === index ? <Loader2 className="animate-spin" /> : <Download />}
                下载
              </Button>
            )}
          </div>
        )
      })}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
