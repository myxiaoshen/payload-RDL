import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload, type Where } from 'payload'
import React from 'react'

import type { FeaturedSoftwareBlock as FeaturedSoftwareBlockProps, Software } from '@/payload-types'

import RichText from '@/components/RichText'
import { SoftwareCard } from '@/components/SoftwareCard'

export const FeaturedSoftwareBlock: React.FC<
  FeaturedSoftwareBlockProps & {
    id?: string
  }
> = async (props) => {
  const {
    id,
    categories,
    introContent,
    limit: limitFromProps,
    onlyFeatured,
    populateBy,
    selectedDocs,
    showMoreLink,
  } = props

  let software: Software[] = []

  if (populateBy === 'selection') {
    software = (selectedDocs ?? []).flatMap((doc) => (typeof doc === 'object' ? [doc] : []))
  } else {
    const payload = await getPayload({ config: configPromise })

    const categoryIds = (categories ?? []).map((category) =>
      typeof category === 'object' ? category.id : category,
    )

    const where: Where = {}
    if (onlyFeatured) where.featured = { equals: true }
    if (categoryIds.length > 0) where.categories = { in: categoryIds }

    const result = await payload.find({
      collection: 'software',
      depth: 1,
      limit: limitFromProps || 6,
      overrideAccess: false,
      sort: ['-featured', '-publishedAt'],
      where,
    })

    software = result.docs
  }

  if (software.length === 0 && !introContent) return null

  return (
    <div className="container" id={`block-${id}`}>
      {introContent && (
        <div className="mb-10">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}

      {software.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          暂无符合条件的软件
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {software.map((doc) => (
            <SoftwareCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      {showMoreLink && (
        <div className="mt-10 text-center">
          <Link
            href="/software"
            className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary"
          >
            查看全部软件
          </Link>
        </div>
      )}
    </div>
  )
}
