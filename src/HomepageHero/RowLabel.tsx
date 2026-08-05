'use client'

import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

type MenuRow = {
  link?: {
    label?: string | null
  } | null
}

export const MenuRowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<MenuRow>()
  const index = data.rowNumber !== undefined ? data.rowNumber + 1 : ''
  const label = data?.data?.link?.label
    ? `菜单 ${index}: ${data.data.link.label}`
    : `菜单 ${index || ''}`.trim()

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
