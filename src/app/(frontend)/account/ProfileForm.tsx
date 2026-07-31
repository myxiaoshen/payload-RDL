'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const ProfileForm: React.FC<{
  userId: string
  initialName: string
}> = ({ userId, initialName }) => {
  const router = useRouter()

  const [name, setName] = useState(initialName)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const data: Record<string, unknown> = { name }

      if (avatarFile) {
        const form = new FormData()
        form.append('file', avatarFile)
        form.append('_payload', JSON.stringify({ alt: name || '头像' }))

        const uploadRes = await fetch('/api/media', {
          method: 'POST',
          credentials: 'include',
          body: form,
        })

        if (!uploadRes.ok) {
          setMessage({ type: 'error', text: '头像上传失败，请稍后重试' })
          return
        }

        const uploaded = await uploadRes.json()
        data.avatar = uploaded?.doc?.id
      }

      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        setMessage({ type: 'error', text: '保存失败，请稍后重试' })
        return
      }

      setAvatarFile(null)
      setMessage({ type: 'ok', text: '资料已更新' })
      router.refresh()
    } catch {
      setMessage({ type: 'error', text: '网络错误，请稍后重试' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
    >
      <h2 className="font-semibold">编辑资料</h2>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-name">姓名</Label>
        <Input
          id="profile-name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-avatar">头像</Label>
        <Input
          id="profile-avatar"
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {message && (
        <p className={message.type === 'ok' ? 'text-sm text-primary' : 'text-sm text-destructive'}>
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={loading} className="self-start">
        {loading ? '保存中…' : '保存资料'}
      </Button>
    </form>
  )
}
