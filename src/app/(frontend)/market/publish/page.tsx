import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { PublishResourceForm } from '@/components/Market/PublishResourceForm'
import { getCurrentUser } from '@/utilities/getCurrentUser'

export const dynamic = 'force-dynamic'

export default async function PublishPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?redirect=/market/publish')

  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'market-categories',
    depth: 0,
    limit: 100,
    sort: 'title',
    select: { title: true },
  })

  return (
    <div className="container max-w-2xl py-24">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">发布资源</h1>
        <p className="mt-2 text-muted-foreground">提交后需经管理员审核，通过后将在交易区上架。</p>
      </header>

      <PublishResourceForm
        categories={categories.docs.map((c) => ({ label: c.title, value: String(c.id) }))}
      />
    </div>
  )
}

export const metadata: Metadata = {
  title: '发布资源',
}
