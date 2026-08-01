'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { CoverImageUpload } from '@/components/PublishForm/CoverImageUpload'
import { MarkdownEditor } from '@/components/PublishForm/MarkdownEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type CategoryOption = { label: string; value: string }

export const BountyPublishForm: React.FC<{ categories: CategoryOption[] }> = ({ categories }) => {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const category = String(form.get('category') || '')
    const coverImage = String(form.get('coverImage') || '')
    const description = String(form.get('description') || '').trim()
    const deadline = String(form.get('deadline') || '')

    const payload = {
      title: String(form.get('title') || '').trim(),
      summary: String(form.get('summary') || '').trim(),
      reward: Number(form.get('reward') || 0),
      category: category || undefined,
      coverImage: coverImage || undefined,
      description: description || undefined,
      deadline: deadline || undefined,
    }

    try {
      const res = await fetch('/api/bounty/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? '发布失败，请检查填写内容')
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
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="font-medium">发布成功，等待管理员审核</p>
        <p className="mt-2 text-sm text-muted-foreground">
          悬赏币已冻结，审核通过后需求将在悬赏区展示；若被驳回将自动退回。
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <a href="/account">返回用户中心</a>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="title">需求标题</Label>
        <Input id="title" name="title" required maxLength={120} placeholder="例如：求某设计模板" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="summary">需求简介</Label>
        <Textarea id="summary" name="summary" required maxLength={200} rows={3} />
      </div>

      <CoverImageUpload name="coverImage" label="封面图（可选）" />

      <MarkdownEditor
        name="description"
        label="需求详情"
        description="详细描述你的需求，支持 Markdown 格式。"
      />

      <div className="grid gap-2">
        <Label htmlFor="category">分类</Label>
        <select
          id="category"
          name="category"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">未分类</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="deadline">截止时间（可选）</Label>
        <Input id="deadline" name="deadline" type="date" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="reward">悬赏 (Coin)</Label>
        <Input id="reward" name="reward" type="number" min={1} defaultValue={10} required />
        <p className="text-xs text-muted-foreground">
          发布时将从余额冻结，采纳方案后发放给完成者。
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending && <Loader2 className="animate-spin" />}
        发布并冻结悬赏
      </Button>
    </form>
  )
}
