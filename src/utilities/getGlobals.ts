import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { type DataFromGlobalSlug, getPayload } from 'payload'
import { cache } from 'react'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(slug: T, depth = 0): Promise<DataFromGlobalSlug<T>> {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
  })

  return global
}

/**
 * Reads the global fresh per request (React cache dedupes within a request).
 * Avoids Next 16 unstable_cache staleness so admin edits show immediately.
 */
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0) =>
  cache(async () => getGlobal<T>(slug, depth))
