import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Series } from '../../../payload-types'

export const revalidateSeries: CollectionAfterChangeHook<Series> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/topics/${doc.slug}`
      payload.logger.info(`Revalidating series at path: ${path}`)
      revalidatePath(path)
      revalidatePath('/topics')
    }

    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/topics/${previousDoc.slug}`
      payload.logger.info(`Revalidating old series at path: ${oldPath}`)
      revalidatePath(oldPath)
      revalidatePath('/topics')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Series> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath(`/topics/${doc?.slug}`)
    revalidatePath('/topics')
  }
  return doc
}
