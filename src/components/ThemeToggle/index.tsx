'use client'

import { Moon, Sun } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import type { Theme } from '@/providers/Theme/types'

import { useTheme } from '@/providers/Theme'
import { cn } from '@/utilities/ui'

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { setTheme, theme } = useTheme()
  // Avoid hydration mismatch: render a stable placeholder until mounted on the client.
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const current: Theme = theme === 'dark' ? 'dark' : 'light'
  const next: Theme = current === 'dark' ? 'light' : 'dark'
  const label = next === 'dark' ? '切换到深色模式' : '切换到浅色模式'

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(next)}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {mounted && current === 'dark' ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  )
}
