import { LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { Software } from '@/payload-types'

import { Button } from '@/components/ui/button'
import { DownloadButtons, type DownloadItem } from './DownloadButtons'

export const DownloadSection: React.FC<{
  software: Software
  isLoggedIn: boolean
}> = ({ software, isLoggedIn }) => {
  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <LockKeyhole className="mx-auto mb-3 size-8 text-muted-foreground" />
        <p className="font-medium">登录后即可下载</p>
        <p className="mt-1 text-sm text-muted-foreground">注册账户后可获取全部版本的下载地址</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button asChild size="sm">
            <Link href={`/login?redirect=/software/${software.slug}`}>登录</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/register?redirect=/software/${software.slug}`}>注册</Link>
          </Button>
        </div>
      </div>
    )
  }

  const items: DownloadItem[] =
    software.downloadFiles?.map((file) => ({
      label: file.label,
      platform: file.platform,
      fileSize: file.fileSize,
    })) ?? []

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        暂无可用的下载文件
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        下载
      </h2>
      <DownloadButtons softwareId={String(software.id)} items={items} />
    </div>
  )
}
