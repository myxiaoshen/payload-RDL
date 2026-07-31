import Link from 'next/link'
import React from 'react'

import type { Software } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { platformBadgeClass, platformLabel } from '@/utilities/platforms'

export type SoftwareCardData = Pick<
  Software,
  | 'slug'
  | 'title'
  | 'summary'
  | 'thumbnail'
  | 'platform'
  | 'version'
  | 'downloadCount'
  | 'categories'
>

export const SoftwareCard: React.FC<{ className?: string; doc: SoftwareCardData }> = ({
  className,
  doc,
}) => {
  const { slug, title, summary, thumbnail, platform, version, downloadCount } = doc

  return (
    <Link
      href={`/software/${slug}`}
      className={cn(
        'group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg',
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
          {thumbnail && typeof thumbnail === 'object' ? (
            <Media resource={thumbnail} imgClassName="size-full object-cover" size="56px" />
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
          {version && <p className="mt-1 text-xs text-muted-foreground">v{version}</p>}
        </div>
      </div>

      {summary && (
        <p className="mt-4 line-clamp-2 flex-1 text-sm text-muted-foreground">{summary}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {platform?.map((p) => (
          <span
            key={p}
            aria-label={`适用平台：${platformLabel(p)}`}
            className={cn('rounded-md px-2 py-0.5 text-xs font-medium', platformBadgeClass(p))}
          >
            {platformLabel(p)}
          </span>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{downloadCount ?? 0} 次下载</span>
      </div>
    </Link>
  )
}
