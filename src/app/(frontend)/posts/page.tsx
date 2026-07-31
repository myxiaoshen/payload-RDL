import type { Metadata } from 'next/types'
import type { Where } from 'payload'

import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { PostCard } from '@/components/PostCard'
import { PostCategoryFilter } from '@/components/PostCategoryFilter'
import { QueryPagination } from '@/components/QueryPagination'
import PageClient from './page.client'

export const dynamic = 'force-dynamic'

const PER_PAGE = 12

type Args = {
  searchParams: Promise<{ category?: string; page?: string }>
}

export default async function Page({ searchParams }: Args) {
  const { category, page } = await searchParams
  const payload = await getPayload({ config: configPromise })

  const currentPage = Number(page) > 0 ? Number(page) : 1

  const where: Where = {}
  if (category) where.categories = { in: [category] }

  const [posts, categories] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: PER_PAGE,
      page: currentPage,
      overrideAccess: false,
      sort: '-publishedAt',
      where,
      select: {
        title: true,
        slug: true,
        heroImage: true,
        categories: true,
        meta: true,
      },
    }),
    payload.find({
      collection: 'categories',
      depth: 0,
      limit: 100,
      sort: 'title',
      select: { title: true },
    }),
  ])

  return (
    <div className="container py-24">
      <PageClient />

      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">文章</h1>
          <p className="mt-2 text-muted-foreground">共 {posts.totalDocs} 篇文章</p>
        </div>
        <Link href="/topics" className="text-sm text-primary hover:underline">
          浏览专题 →
        </Link>
      </header>

      <div className="mb-10">
        <PostCategoryFilter
          categories={categories.docs.map((c) => ({ label: c.title, value: String(c.id) }))}
        />
      </div>

      {posts.docs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
          没有找到符合条件的文章
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.docs.map((doc) => (
            <PostCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      {posts.totalPages > 1 && posts.page && (
        <div className="mt-16">
          <QueryPagination page={posts.page} totalPages={posts.totalPages} />
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: '文章',
    description: '浏览全部文章与专题内容',
  }
}
