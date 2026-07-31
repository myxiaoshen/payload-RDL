import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'

type SeriesArgs = {
  cover: Media
  postIds: number[]
}

export const series1 = ({
  cover,
  postIds,
}: SeriesArgs): RequiredDataFromCollectionSlug<'series'> => ({
  title: '前沿技术精选',
  slug: 'tech-frontier',
  _status: 'published',
  cover: cover.id,
  description: '汇集人工智能、物联网等前沿技术领域的精选文章。',
  posts: postIds,
})

export const series2 = ({
  cover,
  postIds,
}: SeriesArgs): RequiredDataFromCollectionSlug<'series'> => ({
  title: '设计与创作',
  slug: 'design-and-creation',
  _status: 'published',
  cover: cover.id,
  description: '关于视觉设计、创意工作流与工具使用的实用合集。',
  posts: postIds,
})
