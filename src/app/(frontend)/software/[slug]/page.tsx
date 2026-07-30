import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import type { Software } from '@/payload-types'

import { DownloadSection } from '@/components/DownloadSection'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { SoftwareCard } from '@/components/SoftwareCard'
import { generateMeta } from '@/utilities/generateMeta'
import { getCurrentUser } from '@/utilities/getCurrentUser'
import { platformLabel } from '@/utilities/platforms'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function SoftwareDetail({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const { isEnabled: draft } = await draftMode()

  const [software, user] = await Promise.all([querySoftwareBySlug({ slug }), getCurrentUser()])

  if (!software) return notFound()

  const related = await queryRelatedSoftware(software)

  return (
    <article className="container py-24">
      {draft && <LivePreviewListener />}

      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="size-24 shrink-0 overflow-hidden rounded-2xl bg-muted">
          {software.thumbnail && typeof software.thumbnail === 'object' ? (
            <Media
              resource={software.thumbnail}
              imgClassName="size-full object-cover"
              size="96px"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-3xl font-semibold text-muted-foreground">
              {software.title?.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{software.title}</h1>
          {software.summary && <p className="mt-2 text-muted-foreground">{software.summary}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {software.version && (
              <span className="rounded-md bg-muted px-2 py-0.5">v{software.version}</span>
            )}
            {software.platform?.map((p) => (
              <span key={p} className="rounded-md bg-muted px-2 py-0.5">
                {platformLabel(p)}
              </span>
            ))}
            <span>{software.downloadCount ?? 0} 次下载</span>
          </div>
        </div>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {software.screenshots && software.screenshots.length > 0 && (
            <div className="mb-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
              {software.screenshots.map((shot) =>
                shot.image && typeof shot.image === 'object' ? (
                  <div
                    key={shot.id}
                    className="w-[85%] shrink-0 snap-center overflow-hidden rounded-xl border border-border sm:w-[60%]"
                  >
                    <Media resource={shot.image} imgClassName="w-full object-cover" size="60vw" />
                  </div>
                ) : null,
              )}
            </div>
          )}

          {software.description && (
            <RichText className="max-w-none" data={software.description} enableGutter={false} />
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <DownloadSection software={software} isLoggedIn={Boolean(user)} />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-xl font-semibold">相关软件</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((doc) => (
              <SoftwareCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const software = await querySoftwareBySlug({ slug })

  return generateMeta({ doc: software })
}

const queryRelatedSoftware = async (software: Software) => {
  const categoryIds =
    software.categories?.map((c) => (typeof c === 'object' ? c.id : c)).filter(Boolean) ?? []

  if (categoryIds.length === 0) return []

  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'software',
    depth: 1,
    limit: 3,
    overrideAccess: false,
    where: {
      and: [{ categories: { in: categoryIds } }, { id: { not_equals: software.id } }],
    },
  })

  return docs
}

const querySoftwareBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'software',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return docs[0] || null
})
