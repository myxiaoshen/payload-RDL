'use client'

import { useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'

/** 后台左侧导航中的「站点路径总览」入口。 */
export const SiteRoutesNavLink: React.FC = () => {
  const { config } = useConfig()

  return (
    <Link
      className="nav__link"
      href={`${config.routes.admin}/site-routes`}
      style={{ display: 'block', marginBottom: '0.5rem' }}
    >
      <span className="nav__link-label">站点路径总览</span>
    </Link>
  )
}

export default SiteRoutesNavLink
