'use client'

import { Check, Download, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'

export type SubmissionItem = {
  id: number | string
  submitterName: string
  note?: string | null
  content?: unknown
  status: string
  createdAt?: string | null
}

type Props = {
  submissions: SubmissionItem[]
  /** 当前用户是否为发起人（可采纳/下载已采纳方案）。 */
  isOwner: boolean
  /** 悬赏是否仍可采纳（进行中且未结算）。 */
  canAccept: boolean
}

const STATUS_LABEL: Record<string, string> = {
  submitted: '待处理',
  accepted: '已采纳',
  rejected: '未采纳',
}

export const SubmissionList: React.FC<Props> = ({ submissions, isOwner, canAccept }) => {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAccept = async (id: number | string) => {
    if (!confirm('确认采纳该方案？采纳后悬赏币将立即发放给对方，且不可撤销。')) return
    setPendingId(String(id))
    setError(null)
    try {
      const res = await fetch('/api/bounty/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ submissionId: id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? '采纳失败，请稍后重试')
        return
      }
      router.refresh()
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setPendingId(null)
    }
  }

  const handleDownload = async (id: number | string) => {
    setPendingId(String(id))
    setError(null)
    try {
      const res = await fetch('/api/bounty/submission-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ submissionId: id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? '获取下载地址失败')
        return
      }
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setPendingId(null)
    }
  }

  if (submissions.length === 0) {
    return <p className="text-sm text-muted-foreground">暂无提交，快来抢先完成吧。</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {submissions.map((s) => {
        const busy = pendingId === String(s.id)
        return (
          <div
            key={s.id}
            className={cn(
              'rounded-lg border border-border bg-card p-4',
              s.status === 'accepted' && 'border-primary/60',
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{s.submitterName}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  s.status === 'accepted'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {STATUS_LABEL[s.status] ?? s.status}
              </span>
            </div>

            {s.content ? (
              <RichText
                className="mt-2 max-w-none text-sm"
                data={s.content as never}
                enableGutter={false}
              />
            ) : null}

            {s.note && <p className="mt-2 text-sm text-muted-foreground">{s.note}</p>}

            {isOwner && (
              <div className="mt-3 flex flex-wrap gap-2">
                {s.status === 'accepted' ? (
                  <Button size="sm" onClick={() => handleDownload(s.id)} disabled={busy}>
                    {busy ? <Loader2 className="animate-spin" /> : <Download />}
                    下载方案
                  </Button>
                ) : (
                  canAccept && (
                    <Button size="sm" onClick={() => handleAccept(s.id)} disabled={busy}>
                      {busy ? <Loader2 className="animate-spin" /> : <Check />}
                      采纳并发放悬赏
                    </Button>
                  )
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
