import type { Metadata } from 'next'

import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'

import { ReviewActionButtons } from '@/components/Review/ReviewActionButtons'
import { getCurrentUser } from '@/utilities/getCurrentUser'

export const dynamic = 'force-dynamic'

const relName = (value: unknown): string => {
  if (value && typeof value === 'object') {
    const obj = value as { email?: string; name?: string }
    return obj.name || obj.email || '未知'
  }
  return String(value ?? '未知')
}

export default async function ReviewPage() {
  const user = await getCurrentUser()

  if (!user) redirect('/login?redirect=/review')

  if (user.role !== 'admin' && user.role !== 'reviewer') {
    return (
      <div className="container max-w-3xl py-24 text-center">
        <h1 className="mb-2 text-2xl font-bold">无权限访问</h1>
        <p className="text-muted-foreground">该页面仅管理员和审核员可以访问。</p>
      </div>
    )
  }

  const payload = await getPayload({ config: configPromise })

  const [pendingUsers, pendingResources, pendingBounties] = await Promise.all([
    payload.find({
      collection: 'users',
      depth: 0,
      limit: 50,
      overrideAccess: true,
      where: { status: { equals: 'pending' } },
    }),
    payload.find({
      collection: 'market-resources',
      depth: 1,
      limit: 50,
      overrideAccess: true,
      where: { status: { equals: 'pending' } },
    }),
    payload.find({
      collection: 'bounties',
      depth: 1,
      limit: 50,
      overrideAccess: true,
      where: { status: { equals: 'pending' } },
    }),
  ])

  return (
    <div className="container max-w-3xl py-16">
      <h1 className="mb-8 text-2xl font-bold tracking-tight">内容审核</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">待审核用户（{pendingUsers.totalDocs}）</h2>
        {pendingUsers.docs.length === 0 && (
          <p className="text-sm text-muted-foreground">暂无待审核用户</p>
        )}
        <ul className="flex flex-col gap-3">
          {pendingUsers.docs.map((doc) => (
            <li
              className="flex items-center justify-between rounded-lg border border-border p-4"
              key={doc.id}
            >
              <div>
                <p className="font-medium">{doc.name || '未设置姓名'}</p>
                <p className="text-sm text-muted-foreground">{doc.email}</p>
              </div>
              <ReviewActionButtons endpoint="/api/review/users" id={doc.id} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">
          待审核市场资源（{pendingResources.totalDocs}）
        </h2>
        {pendingResources.docs.length === 0 && (
          <p className="text-sm text-muted-foreground">暂无待审核资源</p>
        )}
        <ul className="flex flex-col gap-3">
          {pendingResources.docs.map((doc) => (
            <li
              className="flex items-center justify-between rounded-lg border border-border p-4"
              key={doc.id}
            >
              <div>
                <p className="font-medium">{doc.title}</p>
                <p className="text-sm text-muted-foreground">
                  作者：{relName(doc.author)} · ¥{doc.price ?? 0}
                </p>
              </div>
              <ReviewActionButtons endpoint="/api/review/market-resources" id={doc.id} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">待审核悬赏（{pendingBounties.totalDocs}）</h2>
        {pendingBounties.docs.length === 0 && (
          <p className="text-sm text-muted-foreground">暂无待审核悬赏</p>
        )}
        <ul className="flex flex-col gap-3">
          {pendingBounties.docs.map((doc) => (
            <li
              className="flex items-center justify-between rounded-lg border border-border p-4"
              key={doc.id}
            >
              <div>
                <p className="font-medium">{doc.title}</p>
                <p className="text-sm text-muted-foreground">
                  发起人：{relName(doc.author)} · 悬赏 {doc.reward ?? 0} 平台币
                </p>
              </div>
              <ReviewActionButtons endpoint="/api/review/bounties" id={doc.id} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export const metadata: Metadata = {
  title: '内容审核',
}
