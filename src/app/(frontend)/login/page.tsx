import type { Metadata } from 'next'

import { redirect } from 'next/navigation'
import React, { Suspense } from 'react'

import { getCurrentUser } from '@/utilities/getCurrentUser'
import { LoginForm } from './LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const user = await getCurrentUser()

  if (user) redirect('/account')

  return (
    <div className="container flex justify-center py-24">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8">
        <h1 className="mb-1 text-2xl font-bold tracking-tight">登录</h1>
        <p className="mb-6 text-sm text-muted-foreground">登录后即可下载软件资源</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: '登录',
}
