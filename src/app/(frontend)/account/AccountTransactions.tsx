'use client'

import React from 'react'

import { ListShell } from './ListShell'
import { usePaginatedList } from './usePaginatedList'

type TxDoc = {
  id: number | string
  type: string
  amount: number
  balanceAfter?: number | null
  note?: string | null
  createdAt: string
}

const TYPE_LABEL: Record<string, string> = {
  signin: '每日签到',
  'admin-adjust': '管理员调整',
  'purchase-spend': '购买支出',
  'sale-income': '销售收入',
  membership: '开通会员',
  'bounty-escrow': '悬赏冻结',
  'bounty-reward': '悬赏奖励',
  'bounty-refund': '悬赏退款',
}

type Props = { totalEarnings: number }

export const AccountTransactions: React.FC<Props> = ({ totalEarnings }) => {
  const { docs, page, totalPages, totalDocs, loading, setPage } = usePaginatedList<TxDoc>({
    query: '/api/coin-transactions?depth=0&sort=-createdAt',
  })

  return (
    <ListShell
      loading={loading}
      empty={docs.length === 0}
      emptyText="还没有平台币流水。"
      page={page}
      totalPages={totalPages}
      totalDocs={totalDocs}
      onPageChange={setPage}
      summary={
        <span>
          累计收益：<span className="font-semibold text-emerald-600">{totalEarnings} Coin</span>
        </span>
      }
    >
      {docs.map((t) => (
        <li key={String(t.id)} className="flex items-center justify-between gap-4 px-4 py-3">
          <span className="min-w-0 truncate text-sm">
            <span className="mr-2 text-xs text-muted-foreground">
              {TYPE_LABEL[t.type] ?? t.type}
            </span>
            {t.note}
          </span>
          <span
            className={`shrink-0 text-sm font-medium ${t.amount >= 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}
          >
            {t.amount >= 0 ? '+' : ''}
            {t.amount} Coin · {new Date(t.createdAt).toLocaleDateString('zh-CN')}
          </span>
        </li>
      ))}
    </ListShell>
  )
}
