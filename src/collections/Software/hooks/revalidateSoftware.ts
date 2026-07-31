import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Software } from '../../../payload-types'

export const revalidateSoftware: CollectionAfterChangeHook<Software> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/software/${doc.slug}`

      payload.logger.info(`Revalidating software at path: ${path}`)

      revalidatePath(path)
      revalidatePath('/software')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = `/software/${previousDoc.slug}`

      payload.logger.info(`Revalidating old software at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidatePath('/software')
    }
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Software> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidatePath(`/software/${doc?.slug}`)
    revalidatePath('/software')
  }

  return doc
}
