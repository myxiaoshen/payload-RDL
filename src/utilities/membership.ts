import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

export type MembershipProduct = {
  id: number | string
  title: string
  slug?: string | null
  summary?: string | null
  price: number
}

/**
 * 取当前上架的 VIP 会员商品（交易市场中 productType 为 membership 的资源）。
 * 管理员通过修改该商品的售价来定价；未配置时返回 null。
 */
export const getMembershipProduct = cache(async (): Promise<MembershipProduct | null> => {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'market-resources',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    select: { title: true, slug: true, summary: true, price: true },
    sort: 'price',
    where: {
      and: [{ productType: { equals: 'membership' } }, { status: { equals: 'approved' } }],
    },
  })

  const doc = docs[0]
  if (!doc) return null

  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    summary: doc.summary,
    price: doc.price ?? 0,
  }
})

/** 会员商品详情页链接；未配置商品时退回到 VIP 介绍页。 */
export const getMembershipHref = async (): Promise<string> => {
  const product = await getMembershipProduct()
  return product?.slug ? `/market/${product.slug}` : '/vip'
}
