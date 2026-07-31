import Link from 'next/link'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

export type PostCardData = Pick<Post, 'slug' | 'title' | 'heroImage' | 'categories' | 'meta'>

export const PostCard: React.FC<{ className?: string; doc: PostCardData }> = ({
  className,
  doc,
}) => {
  const { slug, title, heroImage, categories, meta } = doc
  const description = meta?.description
  const cover = heroImage ?? meta?.image

  return (
    <Link
      href={`/posts/${slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg',
        className,
      )}
    >
      <div className="aspect-[16/9] overflow-hidden bg-muted">
        {cover && typeof cover === 'object' ? (
          <Media
            resource={cover}
            imgClassName="size-full object-cover transition-transform group-hover:scale-105"
            size="400px"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-2xl font-semibold text-muted-foreground">
            {title?.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {Array.isArray(categories) && categories.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {categories.map((c) =>
              typeof c === 'object' ? (
                <span
                  key={c.id}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {c.title}
                </span>
              ) : null,
            )}
          </div>
        )}

        <h3 className="font-semibold leading-tight transition-colors group-hover:text-primary">
          {title}
        </h3>

        {description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </Link>
  )
}
