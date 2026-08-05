import type { PayloadRequest } from 'payload'

export type CoinTxType =
  | 'signin'
  | 'admin-adjust'
  | 'purchase-spend'
  | 'sale-income'
  | 'membership'
  | 'bounty-escrow'
  | 'bounty-reward'
  | 'bounty-refund'
  | 'appeal-refund'
  | 'appeal-clawback'

type CoinChangeInput = {
  userId: number | string
  amount: number
  type: CoinTxType
  note?: string
  relatedOrder?: number | string
  relatedBounty?: number | string
  relatedAppeal?: number | string
}

/**
 * Adjusts a user's coin balance and writes an audit transaction.
 * Must be called with a `req` bound to an active DB transaction (see withTransaction).
 */
export const applyCoinDelta = async (
  req: PayloadRequest,
  { userId, amount, type, note, relatedOrder, relatedBounty, relatedAppeal }: CoinChangeInput,
): Promise<number> => {
  const { payload } = req

  const user = await payload.findByID({
    collection: 'users',
    id: userId,
    depth: 0,
    overrideAccess: true,
    req,
  })

  const current = user?.coinBalance ?? 0
  const next = current + amount

  if (next < 0) throw new Error('余额不足')

  await payload.update({
    collection: 'users',
    id: userId,
    data:
      type === 'sale-income'
        ? { coinBalance: next, totalEarnings: (user?.totalEarnings ?? 0) + amount }
        : { coinBalance: next },
    depth: 0,
    overrideAccess: true,
    req,
    context: { skipCoinLog: true, disableRevalidate: true },
  })

  await payload.create({
    collection: 'coin-transactions',
    data: {
      user: userId as number,
      amount,
      balanceAfter: next,
      type,
      note,
      relatedOrder: relatedOrder as number | undefined,
      relatedBounty: relatedBounty as number | undefined,
      relatedAppeal: relatedAppeal as number | undefined,
    },
    depth: 0,
    overrideAccess: true,
    req,
    context: { disableRevalidate: true },
  })

  return next
}
