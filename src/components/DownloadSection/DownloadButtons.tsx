'use client'

import { Download, Loader2 } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { platformLabel } from '@/utilities/platforms'

export type DownloadItem = {
  label: string
  platform?: string | null
  fileSize?: string | null
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
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {[platformLabel(item.platform), item.fileSize].filter(Boolean).join(' · ')}
            </p>
          </div>

          <Button
            size="sm"
            disabled={pending !== null}
            onClick={() => handleDownload(index)}
            aria-label={`下载 ${item.label}`}
          >
            {pending === index ? <Loader2 className="animate-spin" /> : <Download />}
            下载
          </Button>
        </div>
      ))}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
