import type { Metadata } from 'next'

import { Check, Crown } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/utilities/getCurrentUser'
import { getMembershipProduct } from '@/utilities/membership'

export const dynamic = 'force-dynamic'

const benefits = [
  '解锁标记为 VIP 的高级下载资源',
  '优先获取新版本与镜像下载地址',
  '去除下载等待，享受更顺畅的下载体验',
  '专属客服协助与资源需求反馈通道',
]

export default async function VipPage() {
  const [user, product] = await Promise.all([getCurrentUser(), getMembershipProduct()])
  const isVip = user?.role === 'vip' || user?.role === 'admin'
  const productHref = product?.slug ? `/market/${product.slug}` : null

  return (
    <div className="container max-w-3xl py-24">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
        <Crown className="size-4" />
        VIP 会员
      </div>

      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">升级 VIP，解锁全部资源</h1>
      <p className="mt-3 text-muted-foreground">
        部分下载文件仅对 VIP 及以上等级用户开放。成为 VIP 后即可下载这些高级资源。
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {benefits.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
          >
            <Check className="mt-0.5 size-5 shrink-0 text-primary" />
            <span className="text-sm">{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-12 rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">如何开通</h2>
        {isVip ? (
          <p className="mt-2 text-sm text-muted-foreground">
            你已是 VIP 用户，可直接下载全部 VIP 资源。感谢你的支持！
          </p>
        ) : productHref ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              使用平台币即可自助开通，当前价格{' '}
              <span className="font-semibold text-primary">{product!.price} Coin</span>
              。平台币可通过每日签到、出售资源或完成悬赏获得。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={productHref}>立即升级 VIP</Link>
              </Button>
              {!user && (
                <Button asChild size="sm" variant="outline">
                  <Link href="/login?redirect=/vip">登录</Link>
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              管理员尚未在交易市场上架 VIP 会员商品，请先联系管理员为你的账户升级。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {user ? (
                <Button asChild size="sm">
                  <Link href="/account">前往我的账户</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="sm">
                    <Link href="/register?redirect=/vip">免费注册</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/login?redirect=/vip">登录</Link>
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'VIP 会员',
  description: '升级 VIP 解锁全部高级下载资源',
}
