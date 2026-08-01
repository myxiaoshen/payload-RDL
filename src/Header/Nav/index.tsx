'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { HeaderAuthLinks } from './HeaderAuthLinks'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-4 items-center">
      {navItems.length > 0 ? (
        navItems.map(({ link }, i) => <CMSLink key={i} {...link} appearance="link" />)
      ) : (
        <>
          <Link href="/software" className="text-sm hover:text-primary">
            软件下载
          </Link>
          <Link href="/market" className="text-sm hover:text-primary">
            资源交易
          </Link>
          <Link href="/bounty" className="text-sm hover:text-primary">
            任务悬赏
          </Link>
          <Link href="/posts" className="text-sm hover:text-primary">
            文章
          </Link>
          <Link href="/topics" className="text-sm hover:text-primary">
            专题
          </Link>
          <Link href="/contact" className="text-sm hover:text-primary">
            在线留言
          </Link>
        </>
      )}
      <Link href="/search" className="text-sm hover:text-primary" aria-label="搜索">
        搜索
      </Link>
      <ThemeToggle />
      <HeaderAuthLinks />
    </nav>
  )
}
