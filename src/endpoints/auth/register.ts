import type { Endpoint, PayloadRequest } from 'payload'
import { generatePayloadCookie } from 'payload/shared'

const json = (data: unknown, status: number, extraHeaders?: HeadersInit) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...extraHeaders } })

type RegisterBody = {
  captchaTicket?: string
  email?: string
  name?: string
  password?: string
}

/**
 * 注册入口：验证码/开放注册开关在 Users 集合自身的 access.create + beforeValidate 中统一校验。
 * 免审核账号在同一次请求内直接调用本地 login 完成登录并下发 Cookie，
 * 通过 context.skipLoginCaptcha 跳过登录验证码（注册验证码已经证明过是人）。
 */
export const registerEndpoint: Endpoint = {
  path: '/auth/register',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    let body: RegisterBody
    try {
      body = (await req.json?.()) as RegisterBody
    } catch {
      return json({ error: '请求格式无效' }, 400)
    }

    const { captchaTicket, email, name, password } = body ?? {}
    if (!email || !password) {
      return json({ error: '缺少必要参数' }, 400)
    }

    let doc: { status?: null | string }
    try {
      doc = await req.payload.create({
        collection: 'users',
        data: { captchaTicket, email, name, password },
        depth: 0,
        req,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : '注册失败，该邮箱可能已被使用'
      return json({ error: message }, 400)
    }

    if (doc.status && doc.status !== 'approved') {
      return json({ pending: true, success: true }, 200)
    }

    const collection = req.payload.collections.users
    const { token } = await req.payload.login({
      collection: 'users',
      context: { skipLoginCaptcha: true },
      data: { email, password },
      req,
    })

    const cookie = generatePayloadCookie({
      collectionAuthConfig: collection.config.auth,
      cookiePrefix: req.payload.config.cookiePrefix,
      token: token as string,
    })

    return json({ pending: false, success: true }, 200, { 'Set-Cookie': cookie })
  },
}
