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
import {
  formatPublicDisplayName,
  relationId,
  resolvePublicUserProfiles,
} from '@/utilities/publicUserProfile'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug?: string }>
}

const STATUS_LABEL: Record<string, string> = {
  open: '进行中',
  fulfilled: '已完成',
  closed: '已关闭',
  rejected: '已驳回',
  pending: '待审核',
}

const submissionStatusDetail = (status: string | null | undefined): string | null => {
  if (status === 'rejected') return '已选择其他方案'
  return null
}

export default async function BountyDetail({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)

  const [bounty, user] = await Promise.all([
    queryBountyBySlug({ slug: decodedSlug }),
    getCurrentUser(),
  ])

  if (!bounty) return notFound()

  const authorId = relationId(bounty.author)
  // 侧栏/提交身份只看「是否本人发起」；admin 不能冒充发起人，否则看不到提交表单。
  const isAuthor = Boolean(user) && authorId != null && String(authorId) === String(user!.id)
  const isAdmin = user?.role === 'admin'
  // 采纳/下载/查看交付物：发起人或管理员。
  const canManage = isAuthor || Boolean(isAdmin)
  const isOpen = bounty.status === 'open'
  const canAccept = canManage && isOpen && !bounty.escrowReleased
  // 非发起人均可提交（含管理员用普通账号视角参与）。
  const canSubmit = isOpen && !isAuthor

  const payload = await getPayload({ config: configPromise })

  // 公开悬赏对所有人（含访客）加载参与列表；交付物仅发起人/管理员/本人可见。
  const { docs: submissionDocs } = await payload.find({
    collection: 'bounty-submissions',
    where: { bounty: { equals: bounty.id } },
    depth: 0,
    limit: 100,
    overrideAccess: true,
    sort: '-createdAt',
  })

  const profiles = await resolvePublicUserProfiles(payload, [
    bounty.author,
    ...submissionDocs.map((d) => d.submitter),
  ])

  const authorProfile = authorId != null ? profiles.get(String(authorId)) : undefined
  const authorName =
    authorProfile?.displayName ?? (authorId != null ? formatPublicDisplayName(authorId) : '用户')

  let alreadySubmitted = false
  const submissions: SubmissionItem[] = submissionDocs.map((d) => {
    const submitterId = relationId(d.submitter)
    const isSelf = Boolean(user) && submitterId != null && String(submitterId) === String(user!.id)
    if (isSelf) alreadySubmitted = true

    const profile = submitterId != null ? profiles.get(String(submitterId)) : undefined
    const submitterName =
      profile?.displayName ?? (submitterId != null ? formatPublicDisplayName(submitterId) : '用户')

    const item: SubmissionItem = {
      id: d.id,
      submitterName,
      submitterAvatarUrl: profile?.avatarUrl ?? null,
      status: d.status ?? 'submitted',
      statusDetail: submissionStatusDetail(d.status),
      createdAt: d.createdAt,
    }

    // content/note 仅发起人/管理员评审或提交者本人可见；永不传 downloadFile。
    if (canManage || isSelf) {
      item.note = d.note
      item.content = d.content
    }

    return item
  })

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

          <section>
            <h2 className="mb-4 text-xl font-semibold">{isAuthor ? '收到的方案' : '参与者'}</h2>
            <SubmissionList submissions={submissions} isOwner={canManage} canAccept={canAccept} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">悬赏金额</p>
            <p className="mb-4 mt-1 text-3xl font-bold text-primary">{bounty.reward} Coin</p>
            {isAuthor ? (
              <div className="flex flex-col gap-3">
                {isOpen && !bounty.escrowReleased ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      这是你发布的悬赏，可在下方查看并采纳方案。
                    </p>
                    <CloseBountyButton bountyId={bounty.id} reward={bounty.reward} />
                  </>
                ) : bounty.status === 'fulfilled' ? (
                  <p className="text-sm text-muted-foreground">该悬赏已完成，奖励已发放。</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    该悬赏已{STATUS_LABEL[bounty.status ?? ''] ?? '结束'}。
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <SubmitSolutionForm
                  bountyId={bounty.id}
                  isLoggedIn={Boolean(user)}
                  canSubmit={canSubmit}
                  alreadySubmitted={alreadySubmitted}
                  bountyStatus={bounty.status}
                />
                {isAdmin && isOpen && !bounty.escrowReleased && (
                  <CloseBountyButton bountyId={bounty.id} reward={bounty.reward} />
                )}
              </div>
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
