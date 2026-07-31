'use client'

import type { LexicalNode } from '@payloadcms/richtext-lexical/lexical'
import type { Token, TokensList } from 'marked'

import {
  $createBlockNode,
  $createHorizontalRuleNode,
  createClientFeature,
  useEditorConfigContext,
} from '@payloadcms/richtext-lexical/client'
import { $generateNodesFromDOM } from '@payloadcms/richtext-lexical/lexical/html'
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
} from '@payloadcms/richtext-lexical/lexical'
import { Lexer, Parser } from 'marked'
import { useEffect } from 'react'

import type { MarkdownPasteFeatureProps } from './index'

/** 只有出现块级 Markdown 语法时才接管粘贴，避免误伤普通文本。 */
const MARKDOWN_SIGNALS = [
  /^#{1,6}\s+\S/m,
  /^```/m,
  /^\s{0,3}>\s+\S/m,
  /^\s{0,3}[-*+]\s+\S/m,
  /^\s{0,3}\d+\.\s+\S/m,
  /^\s{0,3}(?:[-*_]\s*){3,}$/m,
  /^\|.*\|\s*$/m,
  /\[[^\]]+\]\([^)\s]+\)/,
]

const looksLikeMarkdown = (text: string): boolean =>
  MARKDOWN_SIGNALS.some((pattern) => pattern.test(text))

/** 解析出的 HTML 只进入 DOMParser 与 Lexical 转换，这里额外剔除可执行内容。 */
const stripUnsafeNodes = (doc: Document) => {
  doc.body.querySelectorAll('script, style, iframe, object, embed, link, meta').forEach((el) => {
    el.remove()
  })

  doc.body.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase()
      if (
        name.startsWith('on') ||
        (name === 'href' && attr.value.trim().toLowerCase().startsWith('javascript:'))
      ) {
        el.removeAttribute(attr.name)
      }
    }
  })
}

const createPlainCodeNodes = (code: string): LexicalNode[] => {
  const paragraph = $createParagraphNode()

  code.split('\n').forEach((line, index) => {
    if (index > 0) paragraph.append($createLineBreakNode())
    const text = $createTextNode(line)
    text.setFormat('code')
    paragraph.append(text)
  })

  return [paragraph]
}

const LANGUAGE_ALIASES: Record<string, string> = {
  c: 'cpp',
  'c++': 'cpp',
  console: 'bash',
  dockerfile: 'docker',
  html: 'markup',
  js: 'javascript',
  md: 'markdown',
  ps1: 'powershell',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  shell: 'bash',
  text: 'plaintext',
  ts: 'typescript',
  vue: 'markup',
  xml: 'markup',
  yml: 'yaml',
  zsh: 'bash',
}

/** 代码块 language 是 select 字段，取值必须落在配置选项内，否则保存时校验失败。 */
const normalizeLanguage = (raw: string | undefined, allowed?: string[]): string => {
  const fallback = allowed?.[0] ?? 'plaintext'
  if (!raw) return fallback

  const key = raw.trim().toLowerCase().split(/\s+/)[0] ?? ''
  const mapped = LANGUAGE_ALIASES[key] ?? key

  if (!allowed || allowed.length === 0) return mapped || fallback
  return allowed.includes(mapped) ? mapped : fallback
}

const MarkdownPastePlugin: React.FC<{ clientProps: MarkdownPasteFeatureProps }> = ({
  clientProps,
}) => {
  const { editor } = useEditorConfigContext()
  const codeBlockSlug = clientProps?.codeBlockSlug
  const codeLanguages = clientProps?.codeLanguages

  useEffect(
    () =>
      editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          if (!(event instanceof ClipboardEvent) || !event.clipboardData) return false

          const markdown = event.clipboardData.getData('text/plain')
          if (!markdown?.trim() || !looksLikeMarkdown(markdown)) return false

          const tokens = Lexer.lex(markdown, { gfm: true })

          event.preventDefault()

          editor.update(() => {
            const selection = $getSelection()
            if (!$isRangeSelection(selection)) return

            const nodes: LexicalNode[] = []
            let buffered: Token[] = []

            const flushBuffered = () => {
              if (buffered.length === 0) return

              const html = Parser.parse(buffered as TokensList, { gfm: true })
              const doc = new DOMParser().parseFromString(html, 'text/html')
              stripUnsafeNodes(doc)
              nodes.push(...$generateNodesFromDOM(editor, doc))
              buffered = []
            }

            for (const token of tokens) {
              // 分隔线的 importDOM 会生成服务端节点类，与编辑器注册的客户端类不一致，故单独处理。
              if (token.type === 'hr') {
                flushBuffered()
                nodes.push($createHorizontalRuleNode())
                continue
              }

              if (token.type === 'code') {
                flushBuffered()
                if (codeBlockSlug) {
                  nodes.push(
                    $createBlockNode({
                      blockName: '',
                      blockType: codeBlockSlug,
                      code: token.text,
                      language: normalizeLanguage(token.lang, codeLanguages),
                    }),
                  )
                } else {
                  nodes.push(...createPlainCodeNodes(token.text))
                }
                continue
              }
              buffered.push(token)
            }

            flushBuffered()

            if (nodes.length > 0) $insertNodes(nodes)
          })

          return true
        },
        COMMAND_PRIORITY_LOW,
      ),
    [codeBlockSlug, codeLanguages, editor],
  )

  return null
}

export const MarkdownPasteFeatureClient = createClientFeature<MarkdownPasteFeatureProps>({
  plugins: [
    {
      Component: MarkdownPastePlugin,
      position: 'normal',
    },
  ],
})
