import type { AdminViewServerProps } from 'payload'
import type { CollectionSlug, Where } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import React from 'react'

import type { ApiEndpoint } from '@/utilities/siteRoutes'

import { getAdminOnlyCollections, getSiteRoutes, groupSiteRoutes } from '@/utilities/siteRoutes'
import { getServerSideURL } from '@/utilities/getURL'

const cellStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--theme-elevation-100)',
  padding: '0.6rem 0.75rem',
  textAlign: 'left',
  verticalAlign: 'top',
}

const headStyle: React.CSSProperties = {
  ...cellStyle,
  borderBottom: '1px solid var(--theme-elevation-200)',
  fontSize: 12,
  opacity: 0.7,
  whiteSpace: 'nowrap',
}

const METHOD_COLOR: Record<ApiEndpoint['method'], string> = {
  DELETE: '#c0392b',
  GET: '#2266aa',
  PATCH: '#b7791f',
  POST: '#2f8a3e',
}

/** 纯 CSS 展开面板（<details>），无需 JS 即可在「操作」列点击查看 API 用法。 */
const ApiButton: React.FC<{ endpoints: ApiEndpoint[] }> = ({ endpoints }) => {
  if (endpoints.length === 0) {
    return <span style={{ fontSize: 12, opacity: 0.4 }}>无接口</span>
  }

  return (
    <details style={{ display: 'inline-block', position: 'relative' }}>
      <summary
        style={{
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 6,
          cursor: 'pointer',
          display: 'inline-block',
          fontSize: 12,
          listStyle: 'none',
          padding: '0.15rem 0.6rem',
        }}
      >
        API
      </summary>
      <div
        style={{
          background: 'var(--theme-elevation-0, #fff)',
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          marginTop: 4,
          maxHeight: 320,
          overflowY: 'auto',
          padding: '0.75rem',
          position: 'absolute',
          right: 0,
          top: '100%',
          width: 420,
          zIndex: 20,
        }}
      >
        {endpoints.map((item, index) => (
          <div
            key={`${item.method}-${item.path}`}
            style={{
              borderTop: index === 0 ? 'none' : '1px dashed var(--theme-elevation-150)',
              fontSize: 12,
              padding: '0.4rem 0',
            }}
          >
            <div style={{ alignItems: 'baseline', display: 'flex', gap: 6 }}>
              <span style={{ color: METHOD_COLOR[item.method], fontWeight: 700 }}>
                {item.method}
              </span>
              <code style={{ wordBreak: 'break-all' }}>{item.path}</code>
            </div>
            <div style={{ marginTop: 2, opacity: 0.8 }}>{item.description}</div>
            <div style={{ marginTop: 2, opacity: 0.6 }}>权限：{item.auth ?? '公开'}</div>
          </div>
        ))}
      </div>
    </details>
  )
}

/** 后台「站点路径总览」：列出全部前台页面路由、数据来源与条目数。 */
const SiteRoutesView: React.FC<AdminViewServerProps> = async ({ initPageResult, ...rest }) => {
  const { req } = initPageResult
  const { payload } = req
  const adminRoute = payload.config.routes.admin
  const serverURL = getServerSideURL()

  // 自定义后台视图不走 Payload 的默认鉴权，需在此自行拦截。
  if (!initPageResult.permissions?.canAccessAdmin) {
    redirect(`${adminRoute}/login?redirect=${encodeURIComponent(`${adminRoute}/site-routes`)}`)
  }

  const routes = getSiteRoutes()
  const adminOnlyCollections = getAdminOnlyCollections()

  const counts = new Map<string, number>()
  const adminOnlyCounts = new Map<string, number>()
  await Promise.all([
    ...routes
      .filter((route) => route.collection)
      .map(async (route) => {
        try {
          const { totalDocs } = await payload.count({
            collection: route.collection as CollectionSlug,
            overrideAccess: true,
            where: route.where as Where | undefined,
          })
          counts.set(route.path, totalDocs)
        } catch {
          // 集合不存在或查询失败时不展示数量，不影响整页渲染
        }
      }),
    ...adminOnlyCollections.map(async (item) => {
      try {
        const { totalDocs } = await payload.count({
          collection: item.slug as CollectionSlug,
          overrideAccess: true,
        })
        adminOnlyCounts.set(item.slug, totalDocs)
      } catch {
        // 集合不存在或查询失败时不展示数量，不影响整页渲染
      }
    }),
  ])

  const groups = groupSiteRoutes(routes)
  const unregistered = routes.filter((route) => route.unregistered)

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={rest.locale}
      params={rest.params}
      payload={payload}
      permissions={initPageResult.permissions}
      req={req}
      searchParams={rest.searchParams}
      user={req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <h1 style={{ marginBottom: '0.5rem' }}>站点路径总览</h1>
        <p style={{ marginBottom: '2rem', opacity: 0.7 }}>
          自动扫描前台目录生成，共 {routes.length} 个页面路由。带 [参数] 的是动态路由，实际页面数量
          由对应集合的内容条数决定。
        </p>

        {unregistered.length > 0 && (
          <div
            style={{
              border: '1px solid var(--theme-warning-250, var(--theme-elevation-200))',
              borderRadius: 8,
              marginBottom: '2rem',
              padding: '0.75rem 1rem',
            }}
          >
            <strong>发现 {unregistered.length} 个未登记路由：</strong>
            <span style={{ marginLeft: 8 }}>
              {unregistered.map((route) => route.path).join('、')}
            </span>
            <div style={{ fontSize: 12, marginTop: 6, opacity: 0.7 }}>
              请在 src/utilities/siteRoutes.ts 的 ROUTE_META 中补充中文说明。
            </div>
          </div>
        )}

        {groups.map(({ group, routes: groupRoutes }) => (
          <section key={group} style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>{group}</h3>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={headStyle}>路径</th>
                  <th style={headStyle}>说明</th>
                  <th style={headStyle}>数据来源</th>
                  <th style={headStyle}>页面数</th>
                  <th style={headStyle}>操作</th>
                </tr>
              </thead>
              <tbody>
                {groupRoutes.map((route) => {
                  const count = counts.get(route.path)
                  return (
                    <tr key={route.path}>
                      <td style={{ ...cellStyle, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {route.path}
                      </td>
                      <td style={cellStyle}>{route.label}</td>
                      <td style={cellStyle}>
                        {route.collection ? (
                          <a href={`${adminRoute}/collections/${route.collection}`}>
                            {route.collection}
                          </a>
                        ) : (
                          <span style={{ opacity: 0.5 }}>静态页面</span>
                        )}
                      </td>
                      <td style={cellStyle}>{count ?? (route.dynamic ? '—' : 1)}</td>
                      <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                        <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
                          {route.dynamic ? (
                            <span style={{ opacity: 0.5 }}>需具体条目</span>
                          ) : (
                            <a
                              href={`${serverURL}${route.path}`}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              打开前台
                            </a>
                          )}
                          <ApiButton endpoints={route.api} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>
        ))}

        <section style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>后台管理集合（无独立前台页面）</h3>
          <p style={{ fontSize: 12, marginBottom: '0.75rem', opacity: 0.7 }}>
            这些集合不对应独立的前台页面，仅在后台或通过 API 使用，一并列出避免遗漏。
          </p>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={headStyle}>集合</th>
                <th style={headStyle}>说明</th>
                <th style={headStyle}>记录数</th>
                <th style={headStyle}>操作</th>
              </tr>
            </thead>
            <tbody>
              {adminOnlyCollections.map((item) => (
                <tr key={item.slug}>
                  <td style={{ ...cellStyle, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                    {item.slug}
                  </td>
                  <td style={cellStyle}>{item.label}</td>
                  <td style={cellStyle}>{adminOnlyCounts.get(item.slug) ?? '—'}</td>
                  <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
                      <a href={`${adminRoute}/collections/${item.slug}`}>打开后台</a>
                      <ApiButton endpoints={item.api} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </Gutter>
    </DefaultTemplate>
  )
}

export default SiteRoutesView
