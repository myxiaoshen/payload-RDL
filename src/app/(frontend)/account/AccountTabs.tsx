'use client'

import React, { useState } from 'react'

import { cn } from '@/utilities/ui'
import { AccountActions } from './AccountActions'
import { AccountAssets } from './AccountAssets'
import { AccountBounty } from './AccountBounty'
import { AccountComments } from './AccountComments'
import { AccountFavorites } from './AccountFavorites'
import { AccountOrders } from './AccountOrders'
import { AccountResources } from './AccountResources'
import { AccountTransactions } from './AccountTransactions'
import { ProfileForm } from './ProfileForm'

type TabKey =
  | 'assets'
  | 'orders'
  | 'resources'
  | 'bounty'
  | 'transactions'
  | 'favorites'
  | 'comments'
  | 'settings'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'assets', label: '资产概览' },
  { key: 'orders', label: '我的订单' },
  { key: 'resources', label: '我的资源' },
  { key: 'bounty', label: '我的悬赏' },
  { key: 'transactions', label: '平台币流水' },
  { key: 'favorites', label: '我的收藏' },
  { key: 'comments', label: '我的评论' },
  { key: 'settings', label: '账户设置' },
]

type Props = {
  userId: string
  initialName: string
  coinBalance: number
  totalEarnings: number
  role: string
  signedToday: boolean
  membershipHref: string
  membershipPrice: number | null
  initialTab?: string | null
}

const isTabKey = (value?: string | null): value is TabKey =>
  Boolean(value) && TABS.some((tab) => tab.key === value)

/** 个人中心分标签页展示：只加载当前标签的数据，避免一次性拉取全部列表。 */
export const AccountTabs: React.FC<Props> = ({
  userId,
  initialName,
  coinBalance,
  totalEarnings,
  role,
  signedToday,
  membershipHref,
  membershipPrice,
  initialTab,
}) => {
  const [active, setActive] = useState<TabKey>(isTabKey(initialTab) ? initialTab : 'assets')

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm transition-colors',
              active === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === 'assets' && (
        <AccountAssets
          coinBalance={coinBalance}
          totalEarnings={totalEarnings}
          role={role}
          signedToday={signedToday}
          membershipHref={membershipHref}
          membershipPrice={membershipPrice}
        />
      )}
      {active === 'orders' && <AccountOrders />}
      {active === 'resources' && <AccountResources userId={userId} />}
      {active === 'bounty' && <AccountBounty userId={userId} />}
      {active === 'transactions' && <AccountTransactions totalEarnings={totalEarnings} />}
      {active === 'favorites' && <AccountFavorites />}
      {active === 'comments' && <AccountComments />}
      {active === 'settings' && (
        <div className="flex flex-col gap-8">
          <ProfileForm userId={userId} initialName={initialName} />
          <AccountActions userId={userId} />
        </div>
      )}
    </div>
  )
}
