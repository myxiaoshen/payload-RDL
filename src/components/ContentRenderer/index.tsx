import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { marked } from 'marked'
import React from 'react'

import type { ContentType, HtmlDisplayMode } from '@/fields/contentMode'

import RichText from '@/components/RichText'
import HtmlEmbed from '@/components/ContentRenderer/HtmlEmbed'
import { cn } from '@/utilities/ui'

type Props = {
  contentType?: ContentType | null
  content?: DefaultTypedEditorState | null
  markdownContent?: string | null
  htmlContent?: string | null
  htmlDisplayMode?: HtmlDisplayMode | null
  className?: string
  enableGutter?: boolean
  enableProse?: boolean
}

/** React hydration 会把 \r\n 规整为 \n，服务端注入前先统一换行，避免 SSR 与客户端不一致。 */
const normalizeNewlines = (value: string): string => value.replace(/\r\n?/g, '\n')

/**
 * 根据 contentType 选择正文渲染方式：富文本走 Lexical，Markdown 用 marked 转 HTML，
 * HTML 直接渲染上传/粘贴的源码（仅管理员可发布，内容按原样输出）。
 */
export const ContentRenderer: React.FC<Props> = ({
  contentType,
  content,
  markdownContent,
  htmlContent,
  htmlDisplayMode,
  className,
  enableGutter = false,
  enableProse = true,
}) => {
  if (contentType === 'markdown') {
    const source = normalizeNewlines(markdownContent ?? '')
    const html = marked.parse(source, { async: false, gfm: true }) as string
    return (
      <div
        className={cn(
          'payload-richtext',
          {
            container: enableGutter,
            'max-w-none': !enableGutter,
            'mx-auto prose md:prose-md dark:prose-invert': enableProse,
          },
          className,
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  if (contentType === 'html') {
    return (
      <HtmlEmbed
        html={normalizeNewlines(htmlContent ?? '')}
        mode={htmlDisplayMode ?? 'embed'}
        className={cn({ container: enableGutter }, className)}
      />
    )
  }

  return (
    <RichText
      className={className}
      data={content as DefaultTypedEditorState}
      enableGutter={enableGutter}
      enableProse={enableProse}
    />
  )
}

export default ContentRenderer
