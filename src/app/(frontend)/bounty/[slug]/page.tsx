import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import type { SubmissionItem } from '@/components/Bounty/SubmissionList'

import { Media } from '@/components/Media'
import { CloseBountyButton } from '@/components/Bounty/CloseBountyButton'
import { SubmissionList } from '@/components/Bounty/SubmissionList'
import { SubmitSolutionForm } from '@/components/Bounty/SubmitSolutionForm'
import RichText from '@/components/RichText'
import { getCurrentUser } from '@/utilities/getCurrentUser'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug?: string }>
}

const relId = (value: unknown): number | string | null => {
  if (value == null) return null
  return typeof value === 'object'
    ? (value as { id: number | string }).id
    : (value as number | string)
}

const personName = (value: unknown): string => {
  if (value && typeof value === 'object') {
    const u = value as { name?: string | null; email?: string | null }
    return u.name || u.email || '匿名'
  }
  return '匿名'
}

const STATUS_LABEL: Record<string, string> = {
  open: '进行中',
  fulfilled: '已完成',
  closed: '已关闭',
  rejected: '已驳回',
  pending: '待审核',
}

export default async function BountyDetail({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)

  const [bounty, user] = await Promise.all([
    queryBountyBySlug({ slug: decodedSlug }),
    getCurrentUser(),
  ])

  if (!bounty) return notFound()

  const authorId = relId(bounty.author)
  const authorName = personName(bounty.author)
  const isOwner = Boolean(user) && (user!.role === 'admin' || String(authorId) === String(user!.id))
  const isOpen = bounty.status === 'open'

  const payload = await getPayload({ config: configPromise })

  let submissions: SubmissionItem[] = []
  let alreadySubmitted = false

  if (isOwner) {
    // 已在服务端校验发起人身份，用 overrideAccess 读取全部提交。
    const { docs } = await payload.find({
      collection: 'bounty-submissions',
      where: { bounty: { equals: bounty.id } },
      depth: 1,
      limit: 100,
      overrideAccess: true,
      sort: '-createdAt',
    })
    submissions = docs.map((d) => ({
      id: d.id,
      submitterName: personName(d.submitter),
      note: d.note,
      content: d.content,
      status: d.status ?? 'submitted',
      createdAt: d.createdAt,
    }))
  } else if (user) {
    const { docs } = await payload.find({
      collection: 'bounty-submissions',
      where: {
        and: [{ bounty: { equals: bounty.id } }, { submitter: { equals: user.id } }],
      },
      depth: 0,
      limit: 1,
      overrideAccess: false,
      user,
    })
    alreadySubmitted = docs.length > 0
  }

  const canSubmit = isOpen && !isOwner

  return (
    <article className="container py-24">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="size-24 shrink-0 overflow-hidden rounded-2xl bg-muted">
          {bounty.coverImage && typeof bounty.coverImage === 'object' ? (
            <Media resource={bounty.coverImage} imgClassName="size-full object-cover" size="96px" />
          ) : (
            <div className="flex size-full items-center justify-center text-3xl font-semibold text-muted-foreground">
              {bounty.title?.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{bounty.title}</h1>
          <p className="mt-2 text-muted-foreground">{bounty.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>发起人：{authorName}</span>
            <span>{bounty.submissionCount ?? 0} 个方案</span>
            {bounty.status && <span>状态：{STATUS_LABEL[bounty.status] ?? bounty.status}</span>}
          </div>
        </div>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-12">
          <section>
            {bounty.description ? (
              <RichText className="max-w-none" data={bounty.description} enableGutter={false} />
            ) : (
              <p className="text-muted-foreground">暂无详细需求说明。</p>
            )}
          </section>

          {isOwner && (
            <section>
              <h2 className="mb-4 text-xl font-semibold">收到的方案</h2>
              <SubmissionList
                submissions={submissions}
                isOwner={isOwner}
                canAccept={isOpen && !bounty.escrowReleased}
              />
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">悬赏金额</p>
            <p className="mb-4 mt-1 text-3xl font-bold text-primary">{bounty.reward} Coin</p>
            {isOwner ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  这是你发布的悬赏，可在下方查看并采纳方案。
                </p>
                {isOpen && !bounty.escrowReleased && (
                  <CloseBountyButton bountyId={bounty.id} reward={bounty.reward} />
                )}
              </div>
            ) : (
              <SubmitSolutionForm
                bountyId={bounty.id}
                isLoggedIn={Boolean(user)}
                canSubmit={canSubmit}
                alreadySubmitted={alreadySubmitted}
              />
            )}
          </div>
        </aside>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const bounty = await queryBountyBySlug({ slug: decodeURIComponent(slug) })

  return {
    title: bounty?.title ?? '悬赏',
    description: bounty?.summary ?? undefined,
  }
}

const queryBountyBySlug = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'bounties',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: {
      and: [{ slug: { equals: slug } }, { status: { in: ['open', 'fulfilled', 'closed'] } }],
    },
  })

  return docs[0] || null
})
