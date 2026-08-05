'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  id: number | string
  maxAmount: number
}

/** 申诉审核控件：批准需金额 + 可选说明；驳回可选说明。 */
export const AppealReviewActions: React.FC<Props> = ({ id, maxAmount }) => {
  const router = useRouter()
  const [amount, setAmount] = useState(String(maxAmount > 0 ? maxAmount : ''))
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const act = async (action: 'approve' | 'reject') => {
    setLoading(action)
    setError(null)

    const payload: {
      id: number | string
      action: 'approve' | 'reject'
      amount?: number
      note?: string
    } = { id, action }

    if (action === 'approve') {
      const n = Number(amount)
      if (!Number.isFinite(n) || n <= 0) {
        setError('请填写有效退款金额')
        setLoading(null)
        return
      }
      if (n > maxAmount) {
        setError(`金额不能超过 ${maxAmount}`)
        setLoading(null)
        return
      }
      payload.amount = n
    }

    const trimmed = note.trim()
    if (trimmed) payload.note = trimmed

    try {
      const res = await fetch('/api/review/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? '操作失败')
        return
      }
      router.refresh()
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <div className="grid gap-1">
        <Label htmlFor={`appeal-amount-${id}`}>退款金额（上限 {maxAmount}）</Label>
        <Input
          id={`appeal-amount-${id}`}
          type="number"
          min={0.01}
          step="any"
          max={maxAmount}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!!loading}
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor={`appeal-note-${id}`}>处理说明（可选）</Label>
        <Textarea
          id={`appeal-note-${id}`}
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={!!loading}
          placeholder="发起人可见"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button disabled={!!loading} onClick={() => act('approve')} size="sm">
          {loading === 'approve' ? '处理中…' : '批准退币'}
        </Button>
        <Button disabled={!!loading} onClick={() => act('reject')} size="sm" variant="outline">
          {loading === 'reject' ? '处理中…' : '驳回'}
        </Button>
      </div>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  )
}
