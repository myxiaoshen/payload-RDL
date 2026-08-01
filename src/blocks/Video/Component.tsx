import React from 'react'

import type { VideoBlock as VideoBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { ASPECT_RATIO_CLASS, resolveVideoUrl } from './resolveVideoUrl'

type Props = VideoBlockProps & {
  className?: string
  enableGutter?: boolean
}

const getMediaUrlFromRelation = (value: unknown): string | undefined => {
  if (value && typeof value === 'object' && 'url' in value) {
    const { url } = value as { url?: string | null }
    return url ?? undefined
  }
  return undefined
}

export const VideoBlock: React.FC<Props> = (props) => {
  const {
    source,
    url,
    media,
    poster,
    caption,
    aspectRatio,
    className,
    enableGutter = false,
  } = props

  const posterUrl = getMediaUrlFromRelation(poster)
  const ratioClass = ASPECT_RATIO_CLASS[aspectRatio || '16/9'] ?? ASPECT_RATIO_CLASS['16/9']

  const resolved =
    source === 'upload'
      ? (() => {
          const src = getMediaUrlFromRelation(media)
          return src ? ({ kind: 'file', src } as const) : null
        })()
      : resolveVideoUrl(url)

  if (!resolved) return null

  return (
    <figure className={cn('not-prose my-8', { container: enableGutter }, className)}>
      <div
        className={cn('overflow-hidden rounded-[0.8rem] border border-border bg-black', ratioClass)}
      >
        {resolved.kind === 'iframe' ? (
          <iframe
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            src={resolved.src}
            title={caption || resolved.title}
          />
        ) : (
          <video
            className="h-full w-full"
            controls
            playsInline
            poster={posterUrl}
            preload="metadata"
            src={resolved.src}
          />
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
