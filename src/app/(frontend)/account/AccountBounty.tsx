'use client'

import Link from 'next/link'
import React, { useState } from 'react'

import { AppealForm } from '@/components/Appeals/AppealForm'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { ListShell } from './ListShell'
import { usePaginatedList } from './usePaginatedList'

type BountyDoc = {
  id: number | string
  title?: string | null
  slug?: string | null
  reward: number
  status?: string | null
  submissionCount?: number | null
}

type SubmissionDoc = {
  id: number | string
  status?: string | null
  createdAt: string
  bounty?:
    | { id: number | string; title?: string | null; slug?: string | null; reward?: number | null }
    | number
    | string
}

const BOUNTY_STATUS: Record<string, string> = {
  pending: '待审核',
  open: '进行中',
  fulfilled: '已完成',
  closed: '已关闭',
  rejected: '已驳回',
}

const SUB_STATUS: Record<string, string> = {
  submitted: '待处理',
  accepted: '已采纳',
  rejected: '未采纳',
}

const badge = (active: boolean) =>
  cn(
    'mr-2 shrink-0 rounded-full px-2 py-0.5 text-xs',
    active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
  )

const canAppealBounty = (status?: string | null) =>
  status === 'open' || status === 'fulfilled' || status === 'closed'

type Props = { userId: string }

export const AccountBounty: React.FC<Props> = ({ userId }) => {
  const published = usePaginatedList<BountyDoc>({
    query: `/api/bounties?depth=0&sort=-createdAt&where[author][equals]=${userId}`,
  })
  const submissions = usePaginatedList<SubmissionDoc>({
    query: '/api/bounty-submissions?depth=1&sort=-createdAt',
  })
  const [appealingId, setAppealingId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">我发布的悬赏</h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/bounty/publish">发布悬赏</Link>
          </Button>
        </div>
        <ListShell
          loading={published.loading}
          empty={published.docs.length === 0}
          emptyText="还没有发布悬赏。"
          page={published.page}
          totalPages={published.totalPages}
          totalDocs={published.totalDocs}
          onPageChange={published.setPage}
        >
          {published.docs.map((b) => {
            const isOpen = appealingId === String(b.id)
            const showAppeal = canAppealBounty(b.status)

            return (
              <li key={String(b.id)} className="flex flex-col gap-3 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  {b.slug ? (
                    <Link href={`/bounty/${b.slug}`} className="min-w-0 truncate hover:text-primary">
                      <span className={badge(b.status === 'open')}>
                        {BOUNTY_STATUS[b.status ?? ''] ?? b.status}
                      </span>
                      {b.title || '未命名'}
                    </Link>
                  ) : (
                    <span className="min-w-0 truncate">
                      <span className={badge(b.status === 'open')}>
                        {BOUNTY_STATUS[b.status ?? ''] ?? b.status}
                      </span>
                      {b.title || '未命名'}
                    </span>
                  )}
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {b.reward} Coin · {b.submissionCount ?? 0} 个方案
                    </span>
                    {showAppeal && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setAppealingId(isOpen ? null : String(b.id))}
                      >
                        {isOpen ? '收起' : '申诉'}
                      </Button>
                    )}
                  </div>
                </div>
                {isOpen && (
                  <AppealForm
                    type="bounty"
                    targetId={b.id}
                    targetLabel={`悬赏：${b.title || '未命名'}（${b.reward} Coin）`}
                    onClose={() => setAppealingId(null)}
                  />
                )}
              </li>
            )
          })}
        </ListShell>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">我参与的悬赏</h2>
        <ListShell
          loading={submissions.loading}
          empty={submissions.docs.length === 0}
          emptyText="还没有提交过方案。"
          page={submissions.page}
          totalPages={submissions.totalPages}
          totalDocs={submissions.totalDocs}
          onPageChange={submissions.setPage}
        >
          {submissions.docs.map((s) => {
            const b = s.bounty
            const title = b && typeof b === 'object' ? b.title || '悬赏' : '悬赏'
            const slug = b && typeof b === 'object' ? b.slug : undefined
            const reward = b && typeof b === 'object' ? b.reward : undefined
            const inner = (
              <>
                <span className="min-w-0 truncate">
                  <span className={badge(s.status === 'accepted')}>
                    {SUB_STATUS[s.status ?? ''] ?? s.status}
                  </span>
                  {title}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {reward != null ? `${reward} Coin · ` : ''}
                  {new Date(s.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </>
            )
            return (
              <li key={String(s.id)} className="px-4 py-3">
                {slug ? (
                  <Link
                    href={`/bounty/${slug}`}
                    className="flex items-center justify-between gap-4 hover:text-primary"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="flex items-center justify-between gap-4">{inner}</div>
                )}
              </li>
            )
          })}
        </ListShell>
      </section>
    </div>
  )
}
