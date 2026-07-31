'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type CategoryOption = { label: string; value: string }

export const PublishResourceForm: React.FC<{ categories: CategoryOption[] }> = ({ categories }) => {
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

    const payload = {
      title: String(form.get('title') || '').trim(),
      summary: String(form.get('summary') || '').trim(),
      price: Number(form.get('price') || 0),
      category: category || undefined,
      downloadFile: {
        fileSource: 'url',
        url: String(form.get('url') || '').trim(),
      },
    }

    try {
      const res = await fetch('/api/market-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.errors?.[0]?.message ?? data?.message ?? '发布失败，请检查填写内容')
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
        <p className="font-medium">提交成功，等待管理员审核</p>
        <p className="mt-2 text-sm text-muted-foreground">
          审核通过后资源将在交易区上架，你可在「我的资源」查看状态。
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
        <Label htmlFor="title">资源名称</Label>
        <Input id="title" name="title" required maxLength={120} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="summary">资源介绍</Label>
        <Textarea id="summary" name="summary" required maxLength={200} rows={3} />
      </div>

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
        <Label htmlFor="url">下载文件地址</Label>
        <Input id="url" name="url" type="url" required placeholder="https://" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="price">售价 (Coin)</Label>
        <Input id="price" name="price" type="number" min={0} defaultValue={0} required />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending && <Loader2 className="animate-spin" />}
        提交审核
      </Button>
    </form>
  )
}
