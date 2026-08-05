'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { MarkdownEditor } from '@/components/PublishForm/MarkdownEditor'
import { Button } from '@/components/ui/button'

type Props = {
  type: 'order' | 'bounty'
  targetId: number | string
  targetLabel: string
  onClose?: () => void
}

/** 申诉提交表单：Markdown 详情 + 调用 /api/appeal/create。 */
export const AppealForm: React.FC<Props> = ({ type, targetId, targetLabel, onClose }) => {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const content = String(form.get('content') || '').trim()
    if (!content) {
      setError('请填写申诉详情')
      setPending(false)
      return
    }

    try {
      const res = await fetch('/api/appeal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type, targetId, content }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? '提交失败')
        return
      }
      setDone(true)
      router.refresh()
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setPending(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm">
        <p className="font-medium">申诉已提交</p>
        <p className="mt-1 text-muted-foreground">审核人员处理后会站内通知你。</p>
        {onClose && (
          <Button type="button" size="sm" variant="outline" className="mt-3" onClick={onClose}>
            关闭
          </Button>
        )}
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border border-border p-4"
    >
      <div>
        <p className="text-sm font-medium">发起申诉</p>
        <p className="mt-1 text-xs text-muted-foreground">{targetLabel}</p>
      </div>

      <MarkdownEditor
        name="content"
        label="申诉详情"
        required
        rows={8}
        description="请说明问题与诉求，支持 Markdown。"
        placeholder="例如：资源与描述不符，希望部分退款……"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          提交申诉
        </Button>
        {onClose && (
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={onClose}>
            取消
          </Button>
        )}
      </div>
    </form>
  )
}
