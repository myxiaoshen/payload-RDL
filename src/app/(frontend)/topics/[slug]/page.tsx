import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { PostCard } from '@/components/PostCard'
import { generateMeta } from '@/utilities/generateMeta'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function TopicDetail({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const series = await querySeriesBySlug({ slug })

  if (!series) return notFound()

  const posts = (series.posts ?? []).filter((p): p is Post => typeof p === 'object')

  return (
    <article className="container py-24">
      <header className="mx-auto max-w-3xl text-center">
        {series.cover && typeof series.cover === 'object' && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-border">
            <Media resource={series.cover} imgClassName="w-full object-cover" size="768px" />
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{series.title}</h1>
        {series.description && <p className="mt-4 text-muted-foreground">{series.description}</p>}
        <p className="mt-3 text-sm text-muted-foreground">共 {posts.length} 篇文章</p>
      </header>

      {posts.length > 0 ? (
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((doc) => (
            <PostCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <p className="mt-16 rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
          该专题暂未收录文章
        </p>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const series = await querySeriesBySlug({ slug })
  return generateMeta({ doc: series })
}

const querySeriesBySlug = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'series',
    depth: 2,
    limit: 1,
    overrideAccess: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return docs?.[0] ?? null
})
