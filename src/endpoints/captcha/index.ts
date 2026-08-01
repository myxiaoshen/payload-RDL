import type { Endpoint, PayloadRequest } from 'payload'

import {
  type CaptchaScope,
  generateBuiltinCaptcha,
  getSecuritySettings,
  issueCaptchaTicket,
  verifyBuiltinCaptchaAnswer,
  verifyTurnstileToken,
} from '@/utilities/captcha'

const json = (data: unknown, status: number, extraHeaders?: HeadersInit) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...extraHeaders } })

const VALID_SCOPES: CaptchaScope[] = [
  'admin-login',
  'user-login',
  'user-register',
  'contact-message',
]

/** 下发验证码质询：自建图形验证码返回 SVG+token，Turnstile 返回 siteKey 交前端渲染小组件。 */
export const captchaChallengeEndpoint: Endpoint = {
  path: '/captcha/challenge',
  method: 'get',
  handler: async (req: PayloadRequest) => {
    const settings = await getSecuritySettings(req.payload)

    if (settings.captchaProvider === 'turnstile') {
      return json({ provider: 'turnstile', siteKey: settings.captchaSiteKey ?? '' }, 200)
    }

    const { svg, token } = generateBuiltinCaptcha()
    return json({ provider: 'builtin', svg, token }, 200)
  },
}

type VerifyBody = {
  answer?: string
  scope?: string
  token?: string
}

/** 校验验证码答案/Turnstile token，通过后签发一次性 ticket；admin-login 场景改用 httpOnly Cookie 承载。 */
export const captchaVerifyEndpoint: Endpoint = {
  path: '/captcha/verify',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    let body: VerifyBody
    try {
      body = (await req.json?.()) as VerifyBody
    } catch {
      return json({ error: '请求格式无效' }, 400)
    }

    const scope = body?.scope as CaptchaScope | undefined
    if (!scope || !VALID_SCOPES.includes(scope)) {
      return json({ error: '缺少或不支持的验证场景' }, 400)
    }

    const settings = await getSecuritySettings(req.payload)

    const passed =
      settings.captchaProvider === 'turnstile'
        ? await verifyTurnstileToken(body.token, settings.captchaSecretKey)
        : verifyBuiltinCaptchaAnswer(body.token, body.answer)

    if (!passed) {
      return json({ error: '验证码错误或已过期' }, 400)
    }

    const ticket = issueCaptchaTicket(scope)

    if (scope === 'admin-login') {
      // 后台登录表单无法自定义提交字段，用 httpOnly Cookie 让 Users.beforeLogin 读取凭证。
      return json({ success: true }, 200, {
        'Set-Cookie': `admin_captcha_ticket=${encodeURIComponent(ticket)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`,
      })
    }

    return json({ success: true, ticket }, 200)
  },
}
