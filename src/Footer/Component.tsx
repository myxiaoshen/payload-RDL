import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { BackToTop } from '@/components/BackToTop'

const DEFAULT_DESCRIPTION = '资源下载与学习平台，汇聚软件、教程与优质资源。'

const DEFAULT_QUICK_LINKS = [
  { link: { type: 'custom' as const, label: '文章', url: '/posts' } },
  { link: { type: 'custom' as const, label: '软件下载', url: '/software' } },
  { link: { type: 'custom' as const, label: '资源交易', url: '/market' } },
  { link: { type: 'custom' as const, label: '专题', url: '/topics' } },
  { link: { type: 'custom' as const, label: '搜索', url: '/search' } },
]

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  const description = footerData?.description?.trim() || DEFAULT_DESCRIPTION
  const quickLinks =
    footerData?.quickLinks && footerData.quickLinks.length > 0
      ? footerData.quickLinks
      : DEFAULT_QUICK_LINKS
  const navItems = footerData?.navItems || []
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm space-y-4">
            <Link className="flex items-center" href="/">
              <Logo />
            </Link>
            <p className="text-sm text-white/60">{description}</p>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
            {quickLinks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white/90">快速链接</h3>
                <nav className="flex flex-col gap-2">
                  {quickLinks.map(({ link }, i) => (
                    <CMSLink
                      className="text-sm text-white/60 transition-colors hover:text-white"
                      key={link?.url || link?.label || i}
                      {...link}
                    />
                  ))}
                </nav>
              </div>
            )}

            {navItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white/90">更多</h3>
                <nav className="flex flex-col gap-2">
                  {navItems.map(({ link }, i) => {
                    return (
                      <CMSLink
                        className="text-sm text-white/60 transition-colors hover:text-white"
                        key={i}
                        {...link}
                      />
                    )
                  })}
                </nav>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/90">外观</h3>
              <ThemeSelector />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-sm text-white/50 md:flex-row">
          <p>© {year} Payload-RDL. 保留所有权利。</p>
          <p>基于 Payload CMS 与 Next.js 构建</p>
        </div>
      </div>
      <BackToTop />
    </footer>
  )
}
