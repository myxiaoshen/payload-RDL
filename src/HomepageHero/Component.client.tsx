'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import type { Media as MediaType, Page, Post } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { resolveVideoUrl } from '@/blocks/Video/resolveVideoUrl'
import { cn } from '@/utilities/ui'

type LinkData = {
  type?: ('reference' | 'custom') | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages' | 'posts'
    value: Page | Post | string | number
  } | null
  url?: string | null
  label?: string | null
}

export type HomepageHeroMenuItem = {
  link: LinkData
  id?: string | null
}

export type HomepageHeroSlide = {
  type?: ('image' | 'video') | null
  title?: string | null
  subtitle?: string | null
  image?: (number | null) | MediaType
  enableLink?: boolean | null
  link?: LinkData | null
  videoSource?: ('url' | 'upload') | null
  videoUrl?: string | null
  videoMedia?: (number | null) | MediaType
  poster?: (number | null) | MediaType
  caption?: string | null
  id?: string | null
}

export type HomepageHeroClientProps = {
  menuItems: HomepageHeroMenuItem[]
  slides: HomepageHeroSlide[]
  autoplay?: boolean | null
  autoplayIntervalMs?: number | null
}

const getMediaUrl = (value: unknown): string | undefined => {
  if (value && typeof value === 'object' && 'url' in value) {
    const { url } = value as { url?: string | null }
    return url ?? undefined
  }
  return undefined
}

const hasUsableLink = (link?: LinkData | null): boolean => {
  if (!link) return false
  if (link.type === 'custom') return Boolean(link.url)
  if (link.type === 'reference') {
    return Boolean(
      link.reference &&
      typeof link.reference.value === 'object' &&
      link.reference.value &&
      'slug' in (link.reference.value as object),
    )
  }
  return Boolean(link.url || link.label)
}

export const HomepageHeroClient: React.FC<HomepageHeroClientProps> = ({
  menuItems,
  slides,
  autoplay = true,
  autoplayIntervalMs = 5000,
}) => {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const safeSlides = slides.length > 0 ? slides : []
  const slideCount = safeSlides.length
  const current = safeSlides[index] ?? null
  const isVideoSlide = current?.type === 'video'

  const intervalMs = useMemo(() => {
    const n = typeof autoplayIntervalMs === 'number' ? autoplayIntervalMs : 5000
    return Math.min(20000, Math.max(2000, n || 5000))
  }, [autoplayIntervalMs])

  const goTo = useCallback(
    (next: number) => {
      if (slideCount <= 0) return
      setIndex(((next % slideCount) + slideCount) % slideCount)
    },
    [slideCount],
  )

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index])
  const goNext = useCallback(() => goTo(index + 1), [goTo, index])

  useEffect(() => {
    if (!autoplay || paused || isVideoSlide || slideCount <= 1) return
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slideCount)
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [autoplay, paused, isVideoSlide, slideCount, intervalMs])

  useEffect(() => {
    if (index >= slideCount && slideCount > 0) setIndex(0)
  }, [index, slideCount])

  return (
    <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
      <div className="container py-8 md:py-12">
        <div className="grid gap-4 md:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] md:gap-5">
          {/* Mobile: carousel first via order */}
          <aside className="order-2 md:order-1">
            <div className="h-full rounded-xl border border-border bg-card p-3 shadow-sm md:p-4">
              <div className="mb-3 px-1">
                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">
                  软件导航
                </h2>
              </div>
              <nav className="flex flex-col gap-1" aria-label="首页软件菜单">
                {menuItems.map((item, i) => (
                  <CMSLink
                    key={item.id || item.link?.label || i}
                    {...item.link}
                    className={cn(
                      'block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground no-underline',
                      'transition-colors hover:bg-accent hover:text-accent-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                  />
                ))}
              </nav>
            </div>
          </aside>

          <div
            className="order-1 md:order-2"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="relative aspect-[16/10] w-full md:aspect-[16/9] lg:min-h-[360px]">
                {current ? (
                  current.type === 'video' ? (
                    <VideoSlide slide={current} />
                  ) : (
                    <ImageSlide slide={current} />
                  )
                ) : (
                  <PlaceholderSlide />
                )}
              </div>

              {slideCount > 1 && (
                <>
                  <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-between px-2 md:px-3">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="pointer-events-auto size-9 rounded-full border border-border/60 bg-background/80 shadow-sm backdrop-blur hover:bg-background"
                      onClick={goPrev}
                      aria-label="上一张"
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="pointer-events-auto size-9 rounded-full border border-border/60 bg-background/80 shadow-sm backdrop-blur hover:bg-background"
                      onClick={goNext}
                      aria-label="下一张"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>

                  <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
                    {safeSlides.map((slide, i) => (
                      <button
                        key={slide.id || i}
                        type="button"
                        aria-label={`切换到第 ${i + 1} 张`}
                        aria-current={i === index}
                        className={cn(
                          'h-2 rounded-full transition-all',
                          i === index
                            ? 'w-6 bg-primary'
                            : 'w-2 bg-background/70 hover:bg-background',
                        )}
                        onClick={() => goTo(i)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const PlaceholderSlide: React.FC = () => (
  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-br from-primary/15 via-accent/40 to-background p-6 md:p-10">
    <div className="max-w-xl space-y-3">
      <h1 className="text-2xl font-bold tracking-tight md:text-4xl">精选软件，一站下载</h1>
      <p className="text-sm text-muted-foreground md:text-base">
        汇集常用工具与开发软件，注册账户即可获取全部版本的下载地址。
      </p>
    </div>
  </div>
)

const ImageSlide: React.FC<{ slide: HomepageHeroSlide }> = ({ slide }) => {
  const hasImage = slide.image && typeof slide.image === 'object'
  const showLink = Boolean(slide.enableLink) && hasUsableLink(slide.link)

  return (
    <div className="absolute inset-0">
      {hasImage ? (
        <Media
          fill
          imgClassName="object-cover"
          priority
          resource={slide.image as MediaType}
          htmlElement={null}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/50 to-background" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 z-[1] space-y-3 p-6 md:p-10">
        {(slide.title || slide.subtitle) && (
          <div className="max-w-2xl space-y-2">
            {slide.title && (
              <h1 className="text-2xl font-bold tracking-tight drop-shadow-sm md:text-4xl">
                {slide.title}
              </h1>
            )}
            {slide.subtitle && (
              <p className="max-w-xl text-sm text-muted-foreground md:text-base">
                {slide.subtitle}
              </p>
            )}
          </div>
        )}

        {showLink && slide.link && (
          <CMSLink
            {...slide.link}
            appearance="default"
            className="inline-flex"
            label={slide.link.label || '了解更多'}
          />
        )}
      </div>
    </div>
  )
}

const VideoSlide: React.FC<{ slide: HomepageHeroSlide }> = ({ slide }) => {
  const posterUrl = getMediaUrl(slide.poster)
  const resolved =
    slide.videoSource === 'upload'
      ? (() => {
          const src = getMediaUrl(slide.videoMedia)
          return src ? { kind: 'file' as const, src } : null
        })()
      : resolveVideoUrl(slide.videoUrl)

  return (
    <div className="absolute inset-0 flex flex-col bg-black">
      <div className="relative min-h-0 flex-1">
        {resolved ? (
          resolved.kind === 'iframe' ? (
            <iframe
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              src={resolved.src}
              title={slide.caption || slide.title || resolved.title}
            />
          ) : (
            <video
              className="absolute inset-0 h-full w-full object-contain"
              controls
              playsInline
              poster={posterUrl}
              preload="metadata"
              src={resolved.src}
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted px-6 text-center text-sm text-muted-foreground">
            视频暂不可用，请检查后台配置
          </div>
        )}
      </div>

      {(slide.title || slide.subtitle || slide.caption) && (
        <div className="space-y-1 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
          {slide.title && <p className="text-sm font-semibold">{slide.title}</p>}
          {(slide.subtitle || slide.caption) && (
            <p className="text-xs text-muted-foreground">{slide.subtitle || slide.caption}</p>
          )}
        </div>
      )}
    </div>
  )
}
