import type { BeforeSync } from '@payloadcms/plugin-search/types'

// Called by plugin-search right before a source doc is synced into the `search`
// collection. We flatten the useful display fields so the results page needs no joins.
export const beforeSyncWithSearch: BeforeSync = async ({ originalDoc, searchDoc }) => {
  const doc = originalDoc as {
    slug?: string | null
    title?: string | null
    categories?: unknown
    meta?: { title?: string | null; description?: string | null; image?: unknown } | null
    excerpt?: string | null
    shortDescription?: string | null
  }

  const { slug, title, categories, meta, excerpt, shortDescription } = doc

  const image =
    meta?.image && typeof meta.image === 'object' && 'id' in (meta.image as Record<string, unknown>)
      ? (meta.image as { id: string | number }).id
      : (meta?.image as string | number | undefined)

  const mappedCategories = Array.isArray(categories)
    ? categories
        .map((category) => {
          if (category && typeof category === 'object' && 'title' in category) {
            const c = category as { relationTo?: string; title?: string }
            return { relationTo: c.relationTo ?? 'categories', title: c.title ?? '' }
          }
          return null
        })
        .filter((c): c is { relationTo: string; title: string } => Boolean(c))
    : []

  return {
    ...searchDoc,
    slug: slug ?? null,
    title: title ?? searchDoc.title ?? null,
    meta: {
      title: meta?.title ?? title ?? '',
      description: meta?.description ?? excerpt ?? shortDescription ?? '',
      image: image ?? undefined,
    },
    categories: mappedCategories,
  }
}
