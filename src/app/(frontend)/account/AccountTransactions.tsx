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
  'bounty-reward': '悬赏采纳奖励',
  'bounty-refund': '悬赏退款',
  'appeal-refund': '申诉退款',
  'appeal-clawback': '申诉追回',
}

type Props = { userId: string; totalEarnings: number }

/**
 * 平台币流水：必须按当前用户过滤。
 * coin-transactions 的 read 对 admin 是全量，若不加 where[user]，管理员在个人中心
 * 会看到别人的「悬赏奖励」等流水，误以为发起人也拿到了采纳奖励。
 */
export const AccountTransactions: React.FC<Props> = ({ userId, totalEarnings }) => {
  const { docs, page, totalPages, totalDocs, loading, setPage } = usePaginatedList<TxDoc>({
    query: `/api/coin-transactions?depth=0&sort=-createdAt&where[user][equals]=${encodeURIComponent(userId)}`,
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
