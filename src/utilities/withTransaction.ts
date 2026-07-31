import type { PayloadRequest } from 'payload'

/** Runs `fn` inside a DB transaction bound to `req`, committing on success and rolling back on error. */
export const withTransaction = async <T>(req: PayloadRequest, fn: () => Promise<T>): Promise<T> => {
  const { payload } = req
  const transactionID = await payload.db.beginTransaction()
  if (transactionID) req.transactionID = transactionID

  try {
    const result = await fn()
    if (transactionID) await payload.db.commitTransaction(transactionID)
    return result
  } catch (err) {
    if (transactionID) await payload.db.rollbackTransaction(transactionID)
    throw err
  }
}
