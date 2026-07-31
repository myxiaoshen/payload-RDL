import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { BackToTop } from '@/components/BackToTop'

const quickLinks = [
  { href: '/posts', label: '文章' },
  { href: '/software', label: '软件下载' },
  { href: '/market', label: '资源交易' },
  { href: '/topics', label: '专题' },
  { href: '/search', label: '搜索' },
]

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

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
            <p className="text-sm text-white/60">资源下载与学习平台，汇聚软件、教程与优质资源。</p>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/90">快速链接</h3>
              <ul className="space-y-2">
                {quickLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

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
