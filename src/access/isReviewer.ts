import type { Access, FieldAccess } from 'payload'

/** 仅用于 /review 页面与审核端点内部判断，不写入任何集合的 access 配置。 */
export const isReviewerOrAdmin: Access = ({ req: { user } }) =>
  user?.role === 'admin' || user?.role === 'reviewer'

export const isReviewerOrAdminFieldLevel: FieldAccess = ({ req: { user } }) =>
  user?.role === 'admin' || user?.role === 'reviewer'
