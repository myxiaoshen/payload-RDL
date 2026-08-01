import type { Metadata } from 'next'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/utilities/getCurrentUser'
import { getMembershipProduct } from '@/utilities/membership'
import { AccountTabs } from './AccountTabs'

export const dynamic = 'force-dynamic'

const isToday = (value?: string | null) =>
  Boolean(value) &&
  new Date(value!).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)

export default async function AccountPage() {
  const user = await getCurrentUser()

  if (!user) redirect('/login?redirect=/account')

  const membership = await getMembershipProduct()

  return (
    <div className="container max-w-3xl py-24">
      <header className="mb-10 flex items-center gap-5">
        <div className="size-16 shrink-0 overflow-hidden rounded-full bg-muted">
          {user.avatar && typeof user.avatar === 'object' ? (
            <Media resource={user.avatar} imgClassName="size-full object-cover" size="64px" />
          ) : (
            <div className="flex size-full items-center justify-center text-xl font-semibold text-muted-foreground">
              {(user.name || user.email)?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">
            {user.name || '未设置姓名'}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {user.role === 'admin' ? '管理员' : user.role === 'vip' ? 'VIP 用户' : '普通用户'}
          </p>
        </div>
      </header>

      {user.role === 'admin' && (
        <div className="mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href={`/${process.env.ADMIN_ROUTE || 'admin'}`}>进入后台管理</Link>
          </Button>
        </div>
      )}

      <AccountTabs
        userId={String(user.id)}
        initialName={user.name || ''}
        coinBalance={user.coinBalance ?? 0}
        totalEarnings={user.totalEarnings ?? 0}
        role={user.role ?? 'user'}
        signedToday={isToday(user.lastSigninAt)}
        membershipHref={membership?.slug ? `/market/${membership.slug}` : '/vip'}
        membershipPrice={membership?.price ?? null}
      />
    </div>
  )
}

export const metadata: Metadata = {
  title: '我的账户',
}
