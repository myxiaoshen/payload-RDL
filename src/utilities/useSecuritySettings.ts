'use client'

import { useEffect, useState } from 'react'

/** 前台公开可读的安全设置字段（Turnstile secretKey 不会出现在这里）。 */
export type PublicSecuritySettings = {
  allowRegistration?: boolean
  captchaProvider?: 'builtin' | 'turnstile'
  captchaSiteKey?: string
  contactMessageCaptchaEnabled?: boolean
  requireRegistrationApproval?: boolean
  adminLoginCaptchaEnabled?: boolean
  userLoginCaptchaEnabled?: boolean
  userRegisterCaptchaEnabled?: boolean
}

let cached: null | PublicSecuritySettings = null
let inflight: null | Promise<PublicSecuritySettings> = null

const fetchSettings = (): Promise<PublicSecuritySettings> => {
  if (cached) return Promise.resolve(cached)
  if (!inflight) {
    inflight = fetch('/api/globals/security', { credentials: 'include' })
      .then((res) => res.json())
      .then((data: PublicSecuritySettings) => {
        cached = data
        return data
      })
      .catch(() => ({}) as PublicSecuritySettings)
  }
  return inflight
}

/** 客户端读取 Security 全局设置，模块级缓存避免每个表单各自重复请求。 */
export const useSecuritySettings = (): null | PublicSecuritySettings => {
  const [settings, setSettings] = useState<null | PublicSecuritySettings>(cached)

  useEffect(() => {
    let active = true
    fetchSettings().then((data) => {
      if (active) setSettings(data)
    })
    return () => {
      active = false
    }
  }, [])

  return settings
}
