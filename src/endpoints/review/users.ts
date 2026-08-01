import type { Endpoint, PayloadRequest } from 'payload'

const json = (data: unknown, status: number) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

type ReviewBody = { id?: string | number; action?: 'approve' | 'reject' }

/** 审核待通过的注册用户；仅管理员/审核员可调用，权限判断在此手动完成而非集合 access。 */
export const reviewUsersEndpoint: Endpoint = {
  path: '/review/users',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'reviewer')) {
      return json({ error: '无权限执行此操作' }, 403)
    }

    let body: ReviewBody
    try {
      body = (await req.json?.()) as ReviewBody
    } catch {
      return json({ error: '请求格式无效' }, 400)
    }

    const { id, action } = body ?? {}
    if (id == null || (action !== 'approve' && action !== 'reject')) {
      return json({ error: '缺少必要参数' }, 400)
    }

    const target = await req.payload.findByID({
      collection: 'users',
      id,
      depth: 0,
      disableErrors: true,
      overrideAccess: true,
      req,
    })

    if (!target) {
      return json({ error: '用户不存在' }, 404)
    }

    if (target.status !== 'pending') {
      return json({ error: '该用户不在待审核状态' }, 400)
    }

    const doc = await req.payload.update({
      collection: 'users',
      id,
      data: { status: action === 'approve' ? 'approved' : 'rejected' },
      depth: 0,
      overrideAccess: true,
      req,
    })

    return json({ success: true, status: doc.status }, 200)
  },
}
