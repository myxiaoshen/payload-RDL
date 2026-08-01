import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { Crown } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import { Media } from '@/components/Media'
import { PurchaseButton } from '@/components/Market/PurchaseButton'
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

export default async function MarketDetail({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)

  const [resource, user] = await Promise.all([
    queryResourceBySlug({ slug: decodedSlug }),
    getCurrentUser(),
  ])

  if (!resource) return notFound()

  const authorId = relId(resource.author)
  const authorName =
    resource.author && typeof resource.author === 'object'
      ? resource.author.name || resource.author.email || '匿名'
      : '匿名'

  const isMembership = resource.productType === 'membership'

  const isOwnerOrAdmin =
    Boolean(user) && (user!.role === 'admin' || String(authorId) === String(user!.id))

  let owned = isMembership ? user?.role === 'vip' || user?.role === 'admin' : isOwnerOrAdmin
  if (user && !owned && !isMembership) {
    const payload = await getPayload({ config: configPromise })
    const order = await payload.find({
      collection: 'orders',
      where: {
        and: [{ buyer: { equals: user.id } }, { resource: { equals: resource.id } }],
      },
      limit: 1,
      depth: 0,
      // 订单读取权限依赖当前用户，这里必须显式传 user，否则会被判为匿名而抛 403。
      overrideAccess: false,
      user,
    })
    owned = order.docs.length > 0
  }

  return (
    <article className="container py-24">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="size-24 shrink-0 overflow-hidden rounded-2xl bg-muted">
          {resource.coverImage && typeof resource.coverImage === 'object' ? (
            <Media
              resource={resource.coverImage}
              imgClassName="size-full object-cover"
              size="96px"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-3xl font-semibold text-muted-foreground">
              {resource.title?.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{resource.title}</h1>
          <p className="mt-2 text-muted-foreground">{resource.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {isMembership ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                <Crown className="size-3.5" />
                VIP 会员权益
              </span>
            ) : (
              <span>作者：{authorName}</span>
            )}
            <span>销量 {resource.salesCount ?? 0}</span>
          </div>
        </div>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {resource.description ? (
            <RichText className="max-w-none" data={resource.description} enableGutter={false} />
          ) : (
            <p className="text-muted-foreground">暂无详细介绍。</p>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">售价</p>
            <p className="mb-4 mt-1 text-3xl font-bold text-primary">{resource.price} Coin</p>
            <PurchaseButton
              resourceId={resource.id}
              price={resource.price}
              isLoggedIn={Boolean(user)}
              owned={owned}
              isMembership={isMembership}
            />
          </div>
        </aside>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const resource = await queryResourceBySlug({ slug: decodeURIComponent(slug) })

  return {
    title: resource?.title ?? '资源',
    description: resource?.summary ?? undefined,
  }
}

const queryResourceBySlug = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'market-resources',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'approved' } }],
    },
  })

  return docs[0] || null
})
