'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { CaptchaScope } from '@/utilities/captcha'

type BuiltinChallenge = { provider: 'builtin'; svg: string; token: string }
type TurnstileChallenge = { provider: 'turnstile'; siteKey: string }
type Challenge = BuiltinChallenge | TurnstileChallenge

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { callback: (token: string) => void; sitekey: string },
      ) => string
    }
  }
}

type Props = {
  onReset?: () => void
  onVerified: (ticket: string | undefined) => void
  scope: CaptchaScope
}

/** 通用验证码组件：自建图形验证码需手动输入并点击校验，Turnstile 通过后自动换取 ticket。 */
export const CaptchaWidget: React.FC<Props> = ({ onReset, onVerified, scope }) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [verifying, setVerifying] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const loadChallenge = useCallback(async () => {
    setMessage('')
    setAnswer('')
    onReset?.()
    try {
      const res = await fetch('/api/captcha/challenge', { credentials: 'include' })
      const data = (await res.json()) as Challenge
      setChallenge(data)
    } catch {
      setMessage('验证码加载失败，请刷新页面重试')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadChallenge()
  }, [loadChallenge])

  const verifyBuiltin = async () => {
    if (challenge?.provider !== 'builtin' || !answer) return
    setVerifying(true)
    setMessage('')
    try {
      const res = await fetch('/api/captcha/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, scope, token: challenge.token }),
      })
      const data = (await res.json()) as { error?: string; ticket?: string }
      if (!res.ok) {
        setMessage(data.error || '验证码错误')
        loadChallenge()
        return
      }
      onVerified(data.ticket)
      setMessage('验证通过')
    } finally {
      setVerifying(false)
    }
  }

  const verifyTurnstile = useCallback(
    async (token: string) => {
      setVerifying(true)
      setMessage('')
      try {
        const res = await fetch('/api/captcha/verify', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scope, token }),
        })
        const data = (await res.json()) as { error?: string; ticket?: string }
        if (!res.ok) {
          setMessage(data.error || '验证失败，请重试')
          return
        }
        onVerified(data.ticket)
        setMessage('验证通过')
      } finally {
        setVerifying(false)
      }
    },
    [scope, onVerified],
  )

  useEffect(() => {
    if (challenge?.provider !== 'turnstile' || !containerRef.current) return

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return
      containerRef.current.innerHTML = ''
      window.turnstile.render(containerRef.current, {
        callback: verifyTurnstile,
        sitekey: (challenge as TurnstileChallenge).siteKey,
      })
    }

    if (window.turnstile) {
      renderWidget()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.onload = renderWidget
    document.body.appendChild(script)
  }, [challenge, verifyTurnstile])

  if (!challenge) return null

  if (challenge.provider === 'turnstile') {
    return (
      <div>
        <div ref={containerRef} />
        {message && <p style={{ color: '#c0392b', fontSize: 13 }}>{message}</p>}
      </div>
    )
  }

  return (
    <div>
      <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
        <span
          onClick={loadChallenge}
          role="button"
          style={{ cursor: 'pointer', lineHeight: 0 }}
          title="点击刷新验证码"
          // 后端生成的图形验证码 SVG，非用户输入内容，可信任。
          dangerouslySetInnerHTML={{ __html: challenge.svg }}
        />
        <input
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="请输入图形验证码"
          value={answer}
        />
        <button disabled={verifying || !answer} onClick={verifyBuiltin} type="button">
          {verifying ? '验证中…' : '验证'}
        </button>
      </div>
      {message && (
        <p style={{ color: message === '验证通过' ? '#27ae60' : '#c0392b', fontSize: 13 }}>
          {message}
        </p>
      )}
    </div>
  )
}

export default CaptchaWidget
