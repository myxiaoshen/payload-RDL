import type { Metadata } from 'next'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'

import { AppealReviewActions } from '@/components/Review/AppealReviewActions'
import { ReviewActionButtons } from '@/components/Review/ReviewActionButtons'
import RichText from '@/components/RichText'
import { getCurrentUser } from '@/utilities/getCurrentUser'

export const dynamic = 'force-dynamic'

const relName = (value: unknown): string => {
  if (value && typeof value === 'object') {
    const obj = value as { email?: string; name?: string }
    return obj.name || obj.email || '未知'
  }
  return String(value ?? '未知')
}

const relatedToLabel = (value: unknown): string => {
  if (!value || typeof value !== 'object') return '未知对象'
  const related = value as {
    relationTo?: string
    value?: { title?: string; slug?: string } | number | string | null
  }
  const typeLabel =
    related.relationTo === 'software' ? '软件' : related.relationTo === 'posts' ? '文章' : '内容'
  if (related.value && typeof related.value === 'object') {
    return `${typeLabel}：${related.value.title || related.value.slug || '未知'}`
  }
  return `${typeLabel} #${String(related.value ?? '未知')}`
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

  const [pendingUsers, pendingResources, pendingBounties, pendingComments, pendingAppeals] =
    await Promise.all([
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
      payload.find({
        collection: 'comments',
        depth: 1,
        limit: 50,
        overrideAccess: true,
        where: { status: { equals: 'pending' } },
        sort: '-createdAt',
      }),
      payload.find({
        collection: 'appeals',
        depth: 1,
        limit: 50,
        overrideAccess: true,
        where: { status: { equals: 'pending' } },
        sort: '-createdAt',
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

      <section className="mb-10">
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

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">待审核评论（{pendingComments.totalDocs}）</h2>
        {pendingComments.docs.length === 0 && (
          <p className="text-sm text-muted-foreground">暂无待审核评论</p>
        )}
        <ul className="flex flex-col gap-3">
          {pendingComments.docs.map((doc) => (
            <li
              className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
              key={doc.id}
            >
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap break-words font-medium">{doc.content}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  作者：{relName(doc.author)} · {relatedToLabel(doc.relatedTo)}
                </p>
              </div>
              <ReviewActionButtons endpoint="/api/review/comments" id={doc.id} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">待处理申诉（{pendingAppeals.totalDocs}）</h2>
        {pendingAppeals.docs.length === 0 && (
          <p className="text-sm text-muted-foreground">暂无待处理申诉</p>
        )}
        <ul className="flex flex-col gap-3">
          {pendingAppeals.docs.map((doc) => {
            const order = doc.order && typeof doc.order === 'object' ? doc.order : null
            const bounty = doc.bounty && typeof doc.bounty === 'object' ? doc.bounty : null
            const maxAmount = doc.type === 'order' ? (order?.price ?? 0) : (bounty?.reward ?? 0)
            const targetLabel =
              doc.type === 'order'
                ? order?.resourceTitle || `订单 #${order?.id ?? doc.order ?? ''}`
                : bounty?.title || `悬赏 #${bounty?.id ?? doc.bounty ?? ''}`

            return (
              <li
                className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-start sm:justify-between"
                key={doc.id}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    <span className="mr-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {doc.type === 'order' ? '订单' : '悬赏'}
                    </span>
                    {targetLabel}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    发起人：{relName(doc.applicant)} · 上限 {maxAmount} Coin
                  </p>
                  {doc.content ? (
                    <div className="mt-3 max-h-48 overflow-y-auto rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
                      <RichText
                        data={doc.content as DefaultTypedEditorState}
                        enableGutter={false}
                        enableProse={false}
                      />
                    </div>
                  ) : null}
                </div>
                <AppealReviewActions id={doc.id} maxAmount={maxAmount} />
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

export const metadata: Metadata = {
  title: '内容审核',
}
