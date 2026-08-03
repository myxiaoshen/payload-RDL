'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { HtmlDisplayMode } from '@/fields/contentMode'

type Props = {
  html: string
  mode: HtmlDisplayMode
  className?: string
}

/**
 * 用 iframe(srcDoc) 渲染完整 HTML：样式隔离、脚本可执行。
 * embed 模式随内容自适应高度；fullscreen 模式铺满整个视口覆盖站点框架。
 */
export const HtmlEmbed: React.FC<Props> = ({ html, mode, className }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState<number>(0)

  const syncHeight = useCallback(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc?.body) return
    const next = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight)
    setHeight((prev) => (prev === next ? prev : next))
  }, [])

  useEffect(() => {
    if (mode !== 'embed') return
    const iframe = iframeRef.current
    if (!iframe) return

    let observer: ResizeObserver | undefined

    const handleLoad = () => {
      syncHeight()
      // 内嵌脚本可能动态改变内容高度，持续观察 body 尺寸变化。
      const doc = iframe.contentDocument
      if (doc?.body && typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(() => syncHeight())
        observer.observe(doc.body)
      }
    }

    iframe.addEventListener('load', handleLoad)
    if (iframe.contentDocument?.readyState === 'complete') handleLoad()

    return () => {
      iframe.removeEventListener('load', handleLoad)
      observer?.disconnect()
    }
  }, [html, mode, syncHeight])

  if (mode === 'fullscreen') {
    return (
      <iframe
        ref={iframeRef}
        srcDoc={html}
        title="page-content"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          border: 'none',
          zIndex: 9999,
          background: '#fff',
        }}
      />
    )
  }

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      title="page-content"
      className={className}
      style={{ width: '100%', height: height ? `${height}px` : '80vh', border: 'none' }}
    />
  )
}

export default HtmlEmbed
