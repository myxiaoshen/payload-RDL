import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { ArrowRight, Download, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { SoftwareCard } from '@/components/SoftwareCard'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const highlights = [
  { icon: ShieldCheck, title: '安全可靠', text: '所有资源经过人工审核后上架' },
  { icon: Zap, title: '高速下载', text: '支持本地存储与外部镜像双通道' },
  { icon: Download, title: '版本齐全', text: '同一软件提供多平台多版本下载' },
]

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const [featured, latest, categories] = await Promise.all([
    payload.find({
      collection: 'software',
      depth: 1,
      limit: 3,
      overrideAccess: false,
      where: { featured: { equals: true } },
    }),
    payload.find({
      collection: 'software',
      depth: 1,
      limit: 6,
      overrideAccess: false,
      sort: '-publishedAt',
    }),
    payload.find({
      collection: 'categories',
      depth: 0,
      limit: 12,
      sort: 'title',
      select: { title: true },
    }),
  ])

  return (
    <div>
      <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
        <div className="container py-24 text-center md:py-32">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            精选软件，一站下载
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            汇集常用工具与开发软件，注册账户即可获取全部版本的下载地址。
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/software">
                浏览全部软件
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">免费注册</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6">
              <Icon className="mb-3 size-6 text-primary" />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {categories.docs.length > 0 && (
        <section className="container pb-16">
          <h2 className="mb-5 text-xl font-semibold">按分类浏览</h2>
          <div className="flex flex-wrap gap-2">
            {categories.docs.map((c) => (
              <Link
                key={c.id}
                href={`/software?category=${c.id}`}
                className="rounded-full border border-border px-4 py-1.5 text-sm transition-colors hover:bg-accent"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.docs.length > 0 && (
        <section className="container pb-16">
          <h2 className="mb-6 text-xl font-semibold">编辑推荐</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.docs.map((doc) => (
              <SoftwareCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      )}

      <section className="container pb-24">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">最新上架</h2>
          <Link
            href="/software"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            查看全部
          </Link>
        </div>

        {latest.docs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
            暂无已发布的软件，请先在后台添加
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.docs.map((doc) => (
              <SoftwareCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export const metadata: Metadata = {
  title: '软件下载站',
  description: '精选常用工具与开发软件，登录后即可下载。',
}
