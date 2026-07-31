'use client'

import Link from 'next/link'
import React, { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="select-none text-7xl font-bold tracking-tight text-destructive/20 md:text-9xl">
        !
      </p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">页面出错了</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        很抱歉，加载此页面时发生了错误。你可以重试，或返回首页继续浏览。
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} variant="default">
          重试
        </Button>
        <Button asChild variant="outline">
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    </div>
  )
}
