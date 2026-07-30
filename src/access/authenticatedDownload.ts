import type { FieldAccess } from 'payload'

import type { User } from '@/payload-types'

/** Field-level guard so download URLs never leave the API for anonymous requests. */
export const authenticatedDownload: FieldAccess<any, User> = ({ req: { user } }) => {
  return Boolean(user)
}
