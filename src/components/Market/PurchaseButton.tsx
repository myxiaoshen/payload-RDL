'use client'

import { Crown, Download, Loader2, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'

type Props = {
  resourceId: number | string
  price: number
  isLoggedIn: boolean
  /** 本人发布、管理员或已购买 —— 直接可下载。 */
  owned: boolean
  /** VIP 会员商品：购买后自动升级角色，而非下载文件。 */
  isMembership?: boolean
}

export const PurchaseButton: React.FC<Props> = ({
  resourceId,
  price,
  isLoggedIn,
  owned,
  isMembership = false,
}) => {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState(owned)

  const handlePurchase = async () => {
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/market/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ resourceId }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data?.alreadyOwned) setHasAccess(true)
        setConfirming(false)
        setError(data?.error ?? '购买失败，请稍后重试')
        return
      }
      setHasAccess(true)
      setConfirming(false)
      router.refresh()
    } catch {
      setConfirming(false)
      setError('网络错误，请稍后重试')
    } finally {
      setPending(false)
    }
  }

  const handleDownload = async () => {
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/market/resource-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ resourceId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? '下载失败，请稍后重试')
        return
      }
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setPending(false)
    }
  }

  const openConfirm = () => {
    setError(null)
    setConfirming(true)
  }

  const cancelConfirm = () => {
    if (pending) return
    setConfirming(false)
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-3">
        <Button asChild>
          <Link href={isMembership ? '/login?redirect=/vip' : '/login?redirect=/market'}>
            {isMembership ? '登录后升级' : '登录后购买'}
          </Link>
        </Button>
      </div>
    )
  }

  const confirmPanel = (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-sm font-medium">{isMembership ? '确认升级 VIP' : '确认购买'}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        将扣除 <span className="font-medium text-foreground">{price} Coin</span>
        {isMembership ? ' 并升级为 VIP 会员' : ' 获取该资源'}
        ，确认后不可撤销。
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Button onClick={handlePurchase} disabled={pending} size="sm">
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : isMembership ? (
            <Crown />
          ) : (
            <ShoppingCart />
          )}
          {pending ? '处理中…' : `确认支付 ${price} Coin`}
        </Button>
        <Button onClick={cancelConfirm} disabled={pending} size="sm" variant="ghost">
          再想想
        </Button>
      </div>
    </div>
  )

  if (isMembership) {
    return (
      <div className="flex flex-col gap-3">
        {hasAccess ? (
          <Button disabled>
            <Crown />
            你已是 VIP 会员
          </Button>
        ) : confirming ? (
          confirmPanel
        ) : (
          <Button onClick={openConfirm} disabled={pending}>
            <Crown />
            花费 {price} Coin 升级 VIP
          </Button>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {hasAccess ? (
        <Button onClick={handleDownload} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Download />}
          下载资源
        </Button>
      ) : confirming ? (
        confirmPanel
      ) : (
        <Button onClick={openConfirm} disabled={pending}>
          <ShoppingCart />
          花费 {price} Coin 购买
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
