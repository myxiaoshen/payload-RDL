import Link from 'next/link'
import React from 'react'

import type { Bounty } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

export type BountyCardData = Pick<
  Bounty,
  'slug' | 'title' | 'summary' | 'coverImage' | 'reward' | 'submissionCount' | 'author' | 'status'
>

const authorName = (author: Bounty['author']): string => {
  if (author && typeof author === 'object') return author.name || author.email || '匿名'
  return '匿名'
}

const STATUS_LABEL: Record<string, string> = {
  open: '进行中',
  fulfilled: '已完成',
  closed: '已关闭',
}

export const BountyCard: React.FC<{ className?: string; doc: BountyCardData }> = ({
  className,
  doc,
}) => {
  const { slug, title, summary, coverImage, reward, submissionCount, status } = doc

  return (
    <Link
      href={`/bounty/${slug}`}
      className={cn(
        'group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg',
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
          {coverImage && typeof coverImage === 'object' ? (
            <Media resource={coverImage} imgClassName="size-full object-cover" size="56px" />
          ) : (
            <div className="flex size-full items-center justify-center text-xl font-semibold text-muted-foreground">
              {title?.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-tight transition-colors group-hover:text-primary">
            {title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">发起人：{authorName(doc.author)}</p>
        </div>

        {status && STATUS_LABEL[status] && (
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-xs',
              status === 'open' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
            )}
          >
            {STATUS_LABEL[status]}
          </span>
        )}
      </div>

      {summary && (
        <p className="mt-4 line-clamp-2 flex-1 text-sm text-muted-foreground">{summary}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-bold text-primary">{reward} Coin</span>
        <span className="text-xs text-muted-foreground">{submissionCount ?? 0} 个方案</span>
      </div>
    </Link>
  )
}
