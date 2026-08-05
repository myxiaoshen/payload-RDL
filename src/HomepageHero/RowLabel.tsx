'use client'

import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

type MenuRow = {
  link?: {
    label?: string | null
  } | null
  panel?: {
    tagGroups?: unknown[] | null
    featureCards?: unknown[] | null
  } | null
}

export const MenuRowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<MenuRow>()
  const index = data.rowNumber !== undefined ? data.rowNumber + 1 : ''
  const name = data?.data?.link?.label
  const hasPanel =
    Boolean(data?.data?.panel?.tagGroups?.length) ||
    Boolean(data?.data?.panel?.featureCards?.length)
  const base = name ? `菜单 ${index}: ${name}` : `菜单 ${index || ''}`.trim()
  const label = hasPanel ? `${base} · 有详情` : base

  return <div>{label}</div>
}

type TagGroupRow = {
  title?: string | null
  tags?: unknown[] | null
}

export const TagGroupRowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<TagGroupRow>()
  const index = data.rowNumber !== undefined ? data.rowNumber + 1 : ''
  const title = data?.data?.title
  const count = data?.data?.tags?.length ?? 0
  const label = title
    ? `分组 ${index}: ${title}${count ? `（${count}）` : ''}`
    : `分组 ${index || ''}`.trim()

  return <div>{label}</div>
}

type TagLinkRow = {
  link?: {
    label?: string | null
  } | null
}

export const TagLinkRowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<TagLinkRow>()
  const index = data.rowNumber !== undefined ? data.rowNumber + 1 : ''
  const name = data?.data?.link?.label
  const label = name ? `标签 ${index}: ${name}` : `标签 ${index || ''}`.trim()

  return <div>{label}</div>
}

type FeatureCardRow = {
  title?: string | null
  badge?: string | null
}

export const FeatureCardRowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<FeatureCardRow>()
  const index = data.rowNumber !== undefined ? data.rowNumber + 1 : ''
  const title = data?.data?.title
  const badge = data?.data?.badge
  const label = title
    ? `卡片 ${index}: ${title}${badge ? ` [${badge}]` : ''}`
    : `卡片 ${index || ''}`.trim()

  return <div>{label}</div>
}

type SlideRow = {
  type?: 'image' | 'video' | null
  title?: string | null
  caption?: string | null
}

export const SlideRowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<SlideRow>()
  const index = data.rowNumber !== undefined ? data.rowNumber + 1 : ''
  const kind = data?.data?.type === 'video' ? '视频' : '图片'
  const title = data?.data?.title || data?.data?.caption
  const label = title ? `轮播 ${index}: [${kind}] ${title}` : `轮播 ${index}: ${kind}`

  return <div>{label}</div>
}
