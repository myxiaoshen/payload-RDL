import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="select-none text-7xl font-bold tracking-tight text-primary/20 md:text-9xl">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">页面走丢了</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        抱歉，你访问的页面不存在或已被移动。不如从下面的入口继续探索吧。
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="default">
          <Link href="/">返回首页</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/search">搜索内容</Link>
        </Button>
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <Link href="/posts" className="hover:text-primary hover:underline">
          文章
        </Link>
        <Link href="/software" className="hover:text-primary hover:underline">
          软件下载
        </Link>
        <Link href="/market" className="hover:text-primary hover:underline">
          资源交易
        </Link>
        <Link href="/topics" className="hover:text-primary hover:underline">
          专题
        </Link>
      </div>
    </div>
  )
}
