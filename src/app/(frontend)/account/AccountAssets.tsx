'use client'

import { Crown, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'

type Props = {
  coinBalance: number
  totalEarnings: number
  role: string
  signedToday: boolean
  /** VIP 会员商品详情页链接，未配置商品时为 /vip */
  membershipHref: string
  membershipPrice: number | null
}

/** 资产概览：余额、累计收益、签到与 VIP 升级入口。 */
export const AccountAssets: React.FC<Props> = ({
  coinBalance,
  totalEarnings,
  role,
  signedToday,
  membershipHref,
  membershipPrice,
}) => {
  const router = useRouter()
  const [balance, setBalance] = useState(coinBalance)
  const [signed, setSigned] = useState(signedToday)
  const [pending, setPending] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const checkin = async () => {
    setPending(true)
    setNotice(null)
    try {
      const res = await fetch('/api/market/checkin', { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (res.ok) {
        setBalance(data.balance)
        setSigned(true)
        setNotice(`签到成功，获得 ${data.reward} Coin`)
        router.refresh()
      } else {
        setNotice(data?.error ?? '签到失败')
      }
    } finally {
      setPending(false)
    }
  }

  const canUpgrade = role !== 'admin' && role !== 'vip'

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-border p-5">
        <p className="text-sm text-muted-foreground">平台币余额</p>
        <p className="mt-1 text-3xl font-bold text-primary">{balance} Coin</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button size="sm" onClick={checkin} disabled={signed || pending}>
            {pending && <Loader2 className="animate-spin" />}
            {signed ? '今日已签到' : '每日签到'}
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/market/publish">发布资源</Link>
          </Button>
        </div>
        {notice && <p className="mt-3 text-sm text-muted-foreground">{notice}</p>}
      </div>

      <div className="rounded-lg border border-border p-5">
        <p className="text-sm text-muted-foreground">累计收益</p>
        <p className="mt-1 text-3xl font-bold text-emerald-600">{totalEarnings} Coin</p>
        <div className="mt-4">
          {canUpgrade ? (
            <Button asChild size="sm">
              <Link href={membershipHref}>
                <Crown className="size-4" />
                {membershipPrice === null ? '了解 VIP 会员' : `升级 VIP（${membershipPrice} Coin）`}
              </Link>
            </Button>
          ) : (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              <Crown className="size-4" />
              {role === 'admin' ? '管理员' : 'VIP 会员'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
