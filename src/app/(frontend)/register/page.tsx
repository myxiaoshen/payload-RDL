import type { Metadata } from 'next'

import { redirect } from 'next/navigation'
import React, { Suspense } from 'react'

import { getCurrentUser } from '@/utilities/getCurrentUser'
import { RegisterForm } from './RegisterForm'

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const user = await getCurrentUser()

  if (user) redirect('/account')

  return (
    <div className="container flex justify-center py-24">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8">
        <h1 className="mb-1 text-2xl font-bold tracking-tight">注册账户</h1>
        <p className="mb-6 text-sm text-muted-foreground">免费注册，解锁全部下载资源</p>
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: '注册',
}
