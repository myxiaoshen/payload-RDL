'use client'

import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

type Me = {
  id: number | string
  role?: string | null
  coinBalance?: number | null
  lastSigninAt?: string | null
}

type OrderDoc = {
  id: number | string
  price: number
  createdAt: string
  resourceTitle?: string | null
  resource?: { id: number | string; title?: string | null; slug?: string | null } | number | string
}

type ResourceDoc = {
  id: number | string
  title?: string | null
  slug?: string | null
  price: number
  salesCount?: number | null
  status?: string | null
}

type TxDoc = {
  id: number | string
  type: string
  amount: number
  note?: string | null
  createdAt: string
}

const statusLabel = (s?: string | null) =>
  s === 'approved' ? '已上架' : s === 'rejected' ? '已拒绝' : '待审核'

const isToday = (value?: string | null) =>
  Boolean(value) &&
  new Date(value!).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)

export const AccountMarket: React.FC = () => {
  const [me, setMe] = useState<Me | null>(null)
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [resources, setResources] = useState<ResourceDoc[]>([])
  const [earnings, setEarnings] = useState<TxDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const meRes = await fetch('/api/users/me', { credentials: 'include' }).then((r) => r.json())
      const user: Me | null = meRes?.user ?? null
      setMe(user)

      if (user) {
        const [ordRes, resRes, txRes] = await Promise.all([
          fetch('/api/orders?depth=1&limit=100&sort=-createdAt', { credentials: 'include' }).then(
            (r) => r.json(),
          ),
          fetch(
            `/api/market-resources?depth=0&limit=100&sort=-createdAt&where[author][equals]=${user.id}`,
            { credentials: 'include' },
          ).then((r) => r.json()),
          fetch(
            `/api/coin-transactions?depth=0&limit=100&sort=-createdAt&where[type][equals]=sale-income`,
            { credentials: 'include' },
          ).then((r) => r.json()),
        ])
        setOrders(ordRes?.docs ?? [])
        setResources(resRes?.docs ?? [])
        setEarnings(txRes?.docs ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const checkin = async () => {
    setBusy('checkin')
    setNotice(null)
    try {
      const res = await fetch('/api/market/checkin', { method: 'POST', credentials: 'include' })
      const data = await res.json()
      setNotice(res.ok ? `签到成功，获得 ${data.reward} Coin` : (data?.error ?? '签到失败'))
      if (res.ok) await load()
    } finally {
      setBusy(null)
    }
  }

  const buyMembership = async () => {
    setBusy('membership')
    setNotice(null)
    try {
      const res = await fetch('/api/market/buy-membership', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      setNotice(res.ok ? '已升级为 VIP 会员' : (data?.error ?? '购买失败'))
      if (res.ok) await load()
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">加载中…</p>

  const totalEarnings = earnings.reduce((sum, t) => sum + (t.amount ?? 0), 0)
  const signedToday = isToday(me?.lastSigninAt)

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-4 text-xl font-semibold">我的资产</h2>
        <div className="rounded-lg border border-border p-5">
          <p className="text-sm text-muted-foreground">平台币余额</p>
          <p className="mt-1 text-3xl font-bold text-primary">{me?.coinBalance ?? 0} Coin</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="sm" onClick={checkin} disabled={signedToday || busy !== null}>
              {busy === 'checkin' && <Loader2 className="animate-spin" />}
              {signedToday ? '今日已签到' : '每日签到'}
            </Button>
            {me?.role !== 'admin' && me?.role !== 'vip' && (
              <Button size="sm" variant="outline" onClick={buyMembership} disabled={busy !== null}>
                {busy === 'membership' && <Loader2 className="animate-spin" />}
                购买 VIP 会员（500 Coin）
              </Button>
            )}
            <Button asChild size="sm" variant="outline">
              <Link href="/market/publish">发布资源</Link>
            </Button>
          </div>
          {notice && <p className="mt-3 text-sm text-muted-foreground">{notice}</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">我的订单</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">还没有购买记录。</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {orders.map((o) => {
              const r = o.resource
              const title =
                (r && typeof r === 'object' ? r.title : null) || o.resourceTitle || '资源已下架'
              const slug = r && typeof r === 'object' ? r.slug : undefined
              return (
                <li
                  key={String(o.id)}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  {slug ? (
                    <Link href={`/market/${slug}`} className="min-w-0 truncate hover:text-primary">
                      {title}
                    </Link>
                  ) : (
                    <span className="min-w-0 truncate">{title}</span>
                  )}
                  <span className="shrink-0 text-sm text-muted-foreground">
                    -{o.price} Coin · {new Date(o.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">我的资源</h2>
        {resources.length === 0 ? (
          <p className="text-sm text-muted-foreground">还没有发布资源。</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {resources.map((r) => (
              <li key={String(r.id)} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="min-w-0 truncate">
                  <span className="mr-2 text-xs text-muted-foreground">
                    {statusLabel(r.status)}
                  </span>
                  {r.title || '未命名'}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {r.price} Coin · 销量 {r.salesCount ?? 0}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">收益记录</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          累计收益：<span className="font-semibold text-primary">{totalEarnings} Coin</span>
        </p>
        {earnings.length === 0 ? (
          <p className="text-sm text-muted-foreground">还没有收益记录。</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {earnings.map((t) => (
              <li key={String(t.id)} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="min-w-0 truncate text-sm">{t.note || '资源售出'}</span>
                <span className="shrink-0 text-sm font-medium text-emerald-600">
                  +{t.amount} Coin · {new Date(t.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
