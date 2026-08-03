'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'

import { CaptchaWidget } from '@/components/CaptchaWidget'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSecuritySettings } from '@/utilities/useSecuritySettings'

/** Only allow same-site relative paths so `?redirect=` can't be used for open redirects. */
const safeRedirect = (value: string | null) =>
  value && /^\/(?!\/)/.test(value) ? value : '/software'

export const LoginForm: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = safeRedirect(searchParams.get('redirect'))
  const settings = useSecuritySettings()
  // 默认关闭验证码：仅在安全设置中显式开启时才显示并要求校验。
  const captchaRequired = settings?.userLoginCaptchaEnabled === true

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaTicket, setCaptchaTicket] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (captchaRequired && !captchaTicket) {
      setError('请先完成验证码验证')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, captchaTicket }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.errors?.[0]?.message ?? '邮箱或密码不正确')
        setCaptchaTicket(undefined)
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {captchaRequired && (
        <CaptchaWidget
          onReset={() => setCaptchaTicket(undefined)}
          onVerified={setCaptchaTicket}
          scope="user-login"
        />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? '登录中…' : '登录'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        还没有账户？{' '}
        <Link
          href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
          className="text-primary underline-offset-4 hover:underline"
        >
          立即注册
        </Link>
      </p>
    </form>
  )
}
