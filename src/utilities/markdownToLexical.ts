import type { PayloadRequest } from 'payload'

import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

// 复用站点默认编辑器配置构建一次并缓存，避免每次请求重复初始化。
let editorConfigPromise: ReturnType<typeof editorConfigFactory.default> | null = null

/** 将前台提交的 Markdown 文本转换为 richText 字段所需的 Lexical 结构；空内容返回 undefined。 */
export const markdownToLexical = async (
  req: PayloadRequest,
  markdown?: string | null,
): Promise<unknown | undefined> => {
  const text = markdown?.trim()
  if (!text) return undefined

  if (!editorConfigPromise) {
    editorConfigPromise = editorConfigFactory.default({ config: req.payload.config })
  }
  const editorConfig = await editorConfigPromise

  return convertMarkdownToLexical({ editorConfig, markdown: text })
}
