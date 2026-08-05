'use client'

import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { MarkdownEditor } from '@/components/PublishForm/MarkdownEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  bountyId: number | string
  isLoggedIn: boolean
  /** 悬赏是否仍可提交（进行中且非本人）。 */
  canSubmit: boolean
  /** 当前用户是否已提交过。 */
  alreadySubmitted: boolean
  /** 悬赏当前状态，用于提交后/不可提交文案。 */
  bountyStatus?: string | null
}

export const SubmitSolutionForm: React.FC<Props> = ({
  bountyId,
  isLoggedIn,
  canSubmit,
  alreadySubmitted,
  bountyStatus,
}) => {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(alreadySubmitted)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const payload = {
      bountyId,
      url: String(form.get('url') || '').trim(),
      content: String(form.get('content') || '').trim() || undefined,
      note: String(form.get('note') || '').trim() || undefined,
    }

    try {
      const res = await fetch('/api/bounty/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data?.alreadySubmitted) setDone(true)
        setError(data?.error ?? '提交失败，请稍后重试')
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

  if (!isLoggedIn) {
    return (
      <Button asChild>
        <Link href="/login?redirect=/bounty">登录后提交方案</Link>
      </Button>
    )
  }

  if (done) {
    if (bountyStatus === 'fulfilled') {
      return <p className="text-sm text-muted-foreground">该悬赏已完成。</p>
    }
    if (bountyStatus === 'closed' || bountyStatus === 'rejected') {
      return <p className="text-sm text-muted-foreground">该悬赏已关闭。</p>
    }
    return <p className="text-sm text-muted-foreground">你已提交方案，等待发起人采纳。</p>
  }

  if (!canSubmit) {
    if (bountyStatus === 'fulfilled') {
      return <p className="text-sm text-muted-foreground">该悬赏已完成，不再接受提交。</p>
    }
    if (bountyStatus === 'closed' || bountyStatus === 'rejected') {
      return <p className="text-sm text-muted-foreground">该悬赏已结束，不再接受提交。</p>
    }
    return <p className="text-sm text-muted-foreground">该悬赏暂不接受提交。</p>
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="url">下载地址</Label>
        <Input id="url" name="url" type="url" required placeholder="https://" />
      </div>
      <MarkdownEditor
        name="content"
        label="方案说明（可选）"
        rows={8}
        description="说明你的方案，支持 Markdown 格式。"
      />
      <div className="grid gap-2">
        <Label htmlFor="note">补充备注（可选）</Label>
        <Textarea id="note" name="note" maxLength={500} rows={3} placeholder="提取码等简短信息" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending && <Loader2 className="animate-spin" />}
        提交方案
      </Button>
    </form>
  )
}
