import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { User } from '@/payload-types'

/** Non-redirecting auth check for public pages. */
export const getCurrentUser = async (): Promise<User | null> => {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await getHeaders() })

  return (user as User) ?? null
}
