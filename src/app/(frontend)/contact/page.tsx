import type { Metadata } from 'next'

import React from 'react'

import { ContactForm } from './ContactForm'

export const dynamic = 'force-dynamic'

export default function ContactPage() {
  return (
    <div className="container flex justify-center py-24">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-8">
        <h1 className="mb-1 text-2xl font-bold tracking-tight">联系我们</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          有任何问题或建议？欢迎留言，我们会尽快回复。
        </p>
        <ContactForm />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: '联系我们',
  description: '有任何问题或建议？欢迎给我们留言。',
}
