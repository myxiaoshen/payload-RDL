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
        setError(data?.error ?? '购买失败，请稍后重试')
        return
      }
      setHasAccess(true)
      router.refresh()
    } catch {
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

  if (isMembership) {
    return (
      <div className="flex flex-col gap-3">
        {hasAccess ? (
          <Button disabled>
            <Crown />
            你已是 VIP 会员
          </Button>
        ) : (
          <Button onClick={handlePurchase} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Crown />}
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
      ) : (
        <Button onClick={handlePurchase} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
          花费 {price} Coin 购买
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
