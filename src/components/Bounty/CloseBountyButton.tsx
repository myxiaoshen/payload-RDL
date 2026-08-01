'use client'

import { Loader2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'

type Props = {
  bountyId: number | string
  reward: number
}

/** 发起人关闭未采纳的悬赏，冻结的悬赏币退回余额。 */
export const CloseBountyButton: React.FC<Props> = ({ bountyId, reward }) => {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = async () => {
    if (!confirm(`确认关闭该悬赏？冻结的 ${reward} Coin 将退回你的余额。`)) return
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/bounty/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bountyId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? '关闭失败，请稍后重试')
        return
      }
      router.refresh()
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" onClick={handleClose} disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <XCircle />}
        关闭悬赏并退款
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
