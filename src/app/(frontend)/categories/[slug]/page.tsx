import type { Metadata } from 'next'

import configPromise from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import { PostCard } from '@/components/PostCard'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function CategoryDetail({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const category = await queryCategoryBySlug({ slug })

  if (!category) return notFound()

  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 24,
    overrideAccess: false,
    sort: '-publishedAt',
    where: { categories: { in: [category.id] } },
    select: {
      title: true,
      slug: true,
      heroImage: true,
      categories: true,
      meta: true,
    },
  })

  return (
    <div className="container py-24">
      <header className="mb-12">
        <p className="text-sm text-muted-foreground">文章分类</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">{category.title}</h1>
      </header>

      {posts.docs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
          该分类下暂无文章
        </p>
      ) : (
        <section>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-semibold">相关文章</h2>
            <Link
              href={`/posts?category=${category.id}`}
              className="text-sm text-primary hover:underline"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.docs.map((doc) => (
              <PostCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const category = await queryCategoryBySlug({ slug })

  return {
    title: category ? `${category.title} - 文章分类` : '文章分类',
  }
}

const queryCategoryBySlug = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return docs?.[0] ?? null
})
