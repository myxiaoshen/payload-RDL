'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const AccountActions: React.FC<{ userId: string }> = ({ userId }) => {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirm) {
      setMessage({ type: 'error', text: '两次输入的密码不一致' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        setMessage({ type: 'error', text: '修改失败，请稍后重试' })
        return
      }

      setPassword('')
      setConfirm('')
      setMessage({ type: 'ok', text: '密码已更新' })
    } catch {
      setMessage({ type: 'error', text: '网络错误，请稍后重试' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handlePasswordChange}
        className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
      >
        <h2 className="font-semibold">修改密码</h2>

        <div className="flex flex-col gap-2">
          <Label htmlFor="new-password">新密码</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-password">确认新密码</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {message && (
          <p
            className={message.type === 'ok' ? 'text-sm text-primary' : 'text-sm text-destructive'}
          >
            {message.text}
          </p>
        )}

        <Button type="submit" disabled={loading} className="self-start">
          {loading ? '保存中…' : '保存'}
        </Button>
      </form>

      <Button variant="outline" onClick={handleLogout} className="self-start">
        退出登录
      </Button>
    </div>
  )
}
