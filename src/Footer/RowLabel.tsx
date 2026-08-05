'use client'
import { Footer } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

type FooterLinkRow =
  NonNullable<Footer['quickLinks']>[number] | NonNullable<Footer['navItems']>[number]

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<FooterLinkRow>()

  const label = data?.data?.link?.label
    ? `链接 ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${data?.data?.link?.label}`
    : '链接'

  return <div>{label}</div>
}
