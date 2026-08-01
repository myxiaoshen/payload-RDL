'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'

type Props = {
  endpoint: string
  id: number | string
}

/** 审核操作按钮：调用对应的 /api/review/* 端点，成功后刷新服务端渲染的列表。 */
export const ReviewActionButtons: React.FC<Props> = ({ endpoint, id }) => {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState<null | string>(null)

  const act = async (action: 'approve' | 'reject') => {
    setLoading(action)
    setError(null)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, id }),
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
    <div className="flex items-center gap-2">
      <Button disabled={!!loading} onClick={() => act('approve')} size="sm">
        {loading === 'approve' ? '处理中…' : '通过'}
      </Button>
      <Button disabled={!!loading} onClick={() => act('reject')} size="sm" variant="outline">
        {loading === 'reject' ? '处理中…' : '拒绝'}
      </Button>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  )
}
