import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { Media } from '@/components/Media'

export const dynamic = 'force-dynamic'

export default async function TopicsPage() {
  const payload = await getPayload({ config: configPromise })

  const series = await payload.find({
    collection: 'series',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      cover: true,
      description: true,
    },
  })

  return (
    <div className="container py-24">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">专题</h1>
        <p className="mt-2 text-muted-foreground">精选策划的文章合集</p>
      </header>

      {series.docs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
          暂无专题
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {series.docs.map((doc) => (
            <Link
              key={doc.id}
              href={`/topics/${doc.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="aspect-[16/9] overflow-hidden bg-muted">
                {doc.cover && typeof doc.cover === 'object' ? (
                  <Media
                    resource={doc.cover}
                    imgClassName="size-full object-cover transition-transform group-hover:scale-105"
                    size="400px"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                    {doc.title?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-semibold leading-tight transition-colors group-hover:text-primary">
                  {doc.title}
                </h3>
                {doc.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {doc.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: '专题',
    description: '精选策划的文章合集',
  }
}
