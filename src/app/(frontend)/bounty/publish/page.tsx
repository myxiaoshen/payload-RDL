import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { BountyPublishForm } from '@/components/Bounty/BountyPublishForm'
import { getCurrentUser } from '@/utilities/getCurrentUser'

export const dynamic = 'force-dynamic'

export default async function PublishBountyPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?redirect=/bounty/publish')

  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'bounty-categories',
    depth: 0,
    limit: 100,
    sort: 'title',
    select: { title: true },
  })

  return (
    <div className="container max-w-2xl py-24">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">发布悬赏</h1>
        <p className="mt-2 text-muted-foreground">
          当前余额：{user.coinBalance ?? 0} Coin。发布后需经管理员审核，通过后将在悬赏区展示。
        </p>
      </header>

      <BountyPublishForm
        categories={categories.docs.map((c) => ({ label: c.title, value: String(c.id) }))}
      />
    </div>
  )
}

export const metadata: Metadata = {
  title: '发布悬赏',
}
