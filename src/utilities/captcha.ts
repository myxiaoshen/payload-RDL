import crypto from 'crypto'
import svgCaptcha from 'svg-captcha'
import type { Payload } from 'payload'

/** 区分不同业务场景签发的验证凭证，防止跨场景重放。 */
export type CaptchaScope = 'admin-login' | 'user-login' | 'user-register' | 'contact-message'

export type SecuritySettings = {
  captchaProvider?: ('builtin' | 'turnstile') | null
  captchaSiteKey?: string | null
  captchaSecretKey?: string | null
  adminLoginCaptchaEnabled?: boolean | null
  userLoginCaptchaEnabled?: boolean | null
  userRegisterCaptchaEnabled?: boolean | null
  contactMessageCaptchaEnabled?: boolean | null
  allowRegistration?: boolean | null
  requireRegistrationApproval?: boolean | null
}

const CACHE_TTL_MS = 30_000
let cache: { expiresAt: number; value: SecuritySettings } | null = null

/** 短TTL内存缓存，避免每次登录/注册/留言请求都查一次全局设置。 */
export const getSecuritySettings = async (payload: Payload): Promise<SecuritySettings> => {
  if (cache && cache.expiresAt > Date.now()) return cache.value

  const doc = await payload.findGlobal({ slug: 'security' })
  const value = doc as unknown as SecuritySettings
  cache = { expiresAt: Date.now() + CACHE_TTL_MS, value }
  return value
}

const getHmacKey = (): string => {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('PAYLOAD_SECRET 未配置，无法签发验证码凭证')
  return secret
}

const sign = (value: string): string =>
  crypto.createHmac('sha256', getHmacKey()).update(value).digest('base64url')

const encode = (value: string) => Buffer.from(value, 'utf8').toString('base64url')
const decode = (value: string) => Buffer.from(value, 'base64url').toString('utf8')

// ---------- 自建图形验证码 ----------

const BUILTIN_CAPTCHA_TTL_MS = 5 * 60 * 1000

/** 生成图形验证码：SVG 交给前端展示，token 无状态携带签名后的正确答案。 */
export const generateBuiltinCaptcha = (): { svg: string; token: string } => {
  const { data, text } = svgCaptcha.create({
    size: 4,
    noise: 2,
    color: true,
    ignoreChars: '0oO1ilI',
  })
  const exp = Date.now() + BUILTIN_CAPTCHA_TTL_MS
  const raw = `${text.toLowerCase()}.${exp}`
  return { svg: data, token: `${encode(raw)}.${sign(raw)}` }
}

export const verifyBuiltinCaptchaAnswer = (
  token: string | undefined,
  answer: string | undefined,
): boolean => {
  if (!token || !answer) return false
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return false

  let raw: string
  try {
    raw = decode(encoded)
  } catch {
    return false
  }
  if (sign(raw) !== signature) return false

  const [expectedAnswer, expStr] = raw.split('.')
  const exp = Number(expStr)
  if (!expectedAnswer || !Number.isFinite(exp) || Date.now() > exp) return false

  return expectedAnswer === answer.trim().toLowerCase()
}

// ---------- Cloudflare Turnstile ----------

export const verifyTurnstileToken = async (
  token: string | undefined,
  secretKey: string | undefined | null,
): Promise<boolean> => {
  if (!token || !secretKey) return false

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: secretKey, response: token }),
    })
    const result = (await res.json()) as { success?: boolean }
    return result.success === true
  } catch {
    return false
  }
}

// ---------- 一次性验证凭证：登录/注册/留言场景通用 ----------

const TICKET_TTL_MS = 5 * 60 * 1000

export const issueCaptchaTicket = (scope: CaptchaScope): string => {
  const exp = Date.now() + TICKET_TTL_MS
  const raw = `${scope}.${exp}`
  return `${encode(raw)}.${sign(raw)}`
}

export const verifyCaptchaTicket = (ticket: string | undefined, scope: CaptchaScope): boolean => {
  if (!ticket) return false
  const [encoded, signature] = ticket.split('.')
  if (!encoded || !signature) return false

  let raw: string
  try {
    raw = decode(encoded)
  } catch {
    return false
  }
  if (sign(raw) !== signature) return false

  const [ticketScope, expStr] = raw.split('.')
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || Date.now() > exp) return false

  return ticketScope === scope
}
