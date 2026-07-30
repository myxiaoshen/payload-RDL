import type { Access, FieldAccess, PayloadRequest } from 'payload'

import type { User } from '@/payload-types'

export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'

export const isAdminFieldLevel: FieldAccess<any, User> = ({ req: { user } }) =>
  user?.role === 'admin'

/** `admin.access` must return a plain boolean, unlike collection `Access`. */
export const isAdminBoolean = ({ req }: { req: PayloadRequest }): boolean =>
  req.user?.role === 'admin'
