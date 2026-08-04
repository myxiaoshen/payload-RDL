import type { RequiredDataFromCollectionSlug } from 'payload'

import { simpleRichText } from './software'

type Ids = {
  sellerId: number | string
  buyerId: number | string
  adminId?: number | string
  marketCategoryId: number | string
  bountyCategoryId: number | string
  coverImageId: number | string
}

/** 演示用已上架普通交易资源 */
export const demoMarketResourceNormal = ({
  sellerId,
  marketCategoryId,
  coverImageId,
}: Pick<
  Ids,
  'sellerId' | 'marketCategoryId' | 'coverImageId'
>): RequiredDataFromCollectionSlug<'market-resources'> => ({
  title: 'Next.js 管理后台起步模板',
  slug: 'nextjs-admin-starter',
  summary: '可运行的后台脚手架，含登录页与表格示例，适合快速二次开发。',
  description: simpleRichText([
    '本资源为演示用交易资源：购买后可通过受控下载端点获取文件地址。',
    '价格以平台币结算，卖家获得销售收入流水。',
  ]) as RequiredDataFromCollectionSlug<'market-resources'>['description'],
  coverImage: coverImageId as number,
  category: marketCategoryId as number,
  productType: 'normal',
  price: 30,
  author: sellerId as number,
  salesCount: 0,
  status: 'approved',
  downloadFile: {
    fileSource: 'url',
    url: 'https://example.com/download/nextjs-admin-starter.zip',
  },
})

/** 演示用零价资源（验证免费领取路径） */
export const demoMarketResourceFree = ({
  sellerId,
  marketCategoryId,
  coverImageId,
}: Pick<
  Ids,
  'sellerId' | 'marketCategoryId' | 'coverImageId'
>): RequiredDataFromCollectionSlug<'market-resources'> => ({
  title: '免费 UI 图标包（演示）',
  slug: 'free-icon-pack-demo',
  summary: '零平台币领取的演示资源，用于验证免费购买与下载。',
  description: simpleRichText([
    '价格为 0 的交易资源仍会生成订单，便于统一下载鉴权逻辑。',
  ]) as RequiredDataFromCollectionSlug<'market-resources'>['description'],
  coverImage: coverImageId as number,
  category: marketCategoryId as number,
  productType: 'normal',
  price: 0,
  author: sellerId as number,
  salesCount: 0,
  status: 'approved',
  downloadFile: {
    fileSource: 'url',
    url: 'https://example.com/download/free-icon-pack.zip',
  },
})

/** 演示用 VIP 会员商品（仅管理员应发布；seed 使用 overrideAccess） */
export const demoMembershipProduct = ({
  adminId,
  marketCategoryId,
  coverImageId,
}: {
  adminId: number | string
  marketCategoryId: number | string
  coverImageId: number | string
}): RequiredDataFromCollectionSlug<'market-resources'> => ({
  title: '站点 VIP 永久会员',
  slug: 'site-vip-membership',
  summary: '购买后角色永久升为 VIP，可下载 VIP 门槛软件文件。',
  description: simpleRichText([
    '本模板 VIP 为永久角色，不做到期降级。',
    '会员商品收益归平台，不给作者分成。',
  ]) as RequiredDataFromCollectionSlug<'market-resources'>['description'],
  coverImage: coverImageId as number,
  category: marketCategoryId as number,
  productType: 'membership',
  price: 99,
  author: adminId as number,
  salesCount: 0,
  status: 'approved',
  downloadFile: {
    fileSource: 'url',
    url: 'https://example.com/download/vip-welcome.txt',
  },
})

/** 演示用待审核资源（审核员队列） */
export const demoMarketResourcePending = ({
  sellerId,
  marketCategoryId,
  coverImageId,
}: Pick<
  Ids,
  'sellerId' | 'marketCategoryId' | 'coverImageId'
>): RequiredDataFromCollectionSlug<'market-resources'> => ({
  title: '待审核：设计系统 Figma 源文件',
  slug: 'pending-figma-design-system',
  summary: '演示 pending 审核态，前台访客不可见，作者与管理员可见。',
  description: simpleRichText([
    '审核通过后才会出现在市场列表。',
  ]) as RequiredDataFromCollectionSlug<'market-resources'>['description'],
  coverImage: coverImageId as number,
  category: marketCategoryId as number,
  productType: 'normal',
  price: 45,
  author: sellerId as number,
  salesCount: 0,
  status: 'pending',
  downloadFile: {
    fileSource: 'url',
    url: 'https://example.com/download/figma-design-system.zip',
  },
})

/** 演示用进行中悬赏（托管已在流水中体现，本对象只描述悬赏文档） */
export const demoBountyOpen = ({
  authorId,
  bountyCategoryId,
  coverImageId,
}: {
  authorId: number | string
  bountyCategoryId: number | string
  coverImageId: number | string
}): RequiredDataFromCollectionSlug<'bounties'> => ({
  title: '求一份 Payload CMS 自定义 Endpoint 示例',
  slug: 'ask-payload-endpoint-sample',
  summary: '需要可运行的购买/鉴权 Endpoint 示例与简要说明文档。',
  description: simpleRichText([
    '演示悬赏：发布时已托管平台币，审核通过后状态为进行中。',
    '完成者可提交方案，发起人采纳后发放托管奖励。',
  ]) as RequiredDataFromCollectionSlug<'bounties'>['description'],
  coverImage: coverImageId as number,
  category: bountyCategoryId as number,
  reward: 40,
  author: authorId as number,
  submissionCount: 0,
  escrowReleased: false,
  status: 'open',
})

/** 演示用待审核悬赏 */
export const demoBountyPending = ({
  authorId,
  bountyCategoryId,
  coverImageId,
}: {
  authorId: number | string
  bountyCategoryId: number | string
  coverImageId: number | string
}): RequiredDataFromCollectionSlug<'bounties'> => ({
  title: '求 macOS 效率工具对比表（待审核）',
  slug: 'ask-macos-tools-comparison-pending',
  summary: '演示悬赏 pending 态：已托管但尚未开放提交。',
  description: simpleRichText([
    '审核通过后 status 变为 open。',
  ]) as RequiredDataFromCollectionSlug<'bounties'>['description'],
  coverImage: coverImageId as number,
  category: bountyCategoryId as number,
  reward: 20,
  author: authorId as number,
  submissionCount: 0,
  escrowReleased: false,
  status: 'pending',
})
