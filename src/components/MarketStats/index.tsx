import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

/** 后台首页交易数据概览：总成交额、订单数、热门资源。 */
const MarketStats = async () => {
  const payload = await getPayload({ config: configPromise })

  const [orders, hot] = await Promise.all([
    payload.find({
      collection: 'orders',
      depth: 0,
      limit: 0,
      pagination: false,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'market-resources',
      depth: 0,
      limit: 5,
      overrideAccess: true,
      sort: '-salesCount',
      where: { status: { equals: 'approved' } },
    }),
  ])

  const totalRevenue = orders.docs.reduce((sum, o) => sum + (o.price ?? 0), 0)

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '0.75rem' }}>交易数据统计</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div
          style={{
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 8,
            padding: '0.75rem 1.25rem',
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>总成交额</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{totalRevenue} Coin</div>
        </div>
        <div
          style={{
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 8,
            padding: '0.75rem 1.25rem',
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>订单总数</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{orders.totalDocs}</div>
        </div>
      </div>

      {hot.docs.length > 0 && (
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: '0.5rem' }}>热门资源 Top 5</div>
          <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {hot.docs.map((r) => (
              <li key={r.id}>
                {r.title} —— 销量 {r.salesCount ?? 0}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default MarketStats
