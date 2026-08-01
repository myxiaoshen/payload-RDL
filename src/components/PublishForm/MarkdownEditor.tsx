'use client'

import {
  Bold,
  Code,
  Heading,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
} from 'lucide-react'
import { marked } from 'marked'
import React, { useCallback, useMemo, useRef, useState } from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/utilities/ui'

type Props = {
  name: string
  label: string
  required?: boolean
  rows?: number
  placeholder?: string
  description?: string
}

type ToolAction =
  | { type: 'wrap'; before: string; after: string; placeholder: string }
  | { type: 'linePrefix'; prefix: string }
  | { type: 'insert'; text: string }

const TOOLS: { icon: React.ElementType; title: string; action: ToolAction }[] = [
  { icon: Heading, title: '标题', action: { type: 'linePrefix', prefix: '## ' } },
  {
    icon: Bold,
    title: '加粗',
    action: { type: 'wrap', before: '**', after: '**', placeholder: '加粗文字' },
  },
  {
    icon: Italic,
    title: '斜体',
    action: { type: 'wrap', before: '*', after: '*', placeholder: '斜体文字' },
  },
  {
    icon: Code,
    title: '行内代码',
    action: { type: 'wrap', before: '`', after: '`', placeholder: '代码' },
  },
  { icon: Quote, title: '引用', action: { type: 'linePrefix', prefix: '> ' } },
  { icon: List, title: '无序列表', action: { type: 'linePrefix', prefix: '- ' } },
  { icon: ListOrdered, title: '有序列表', action: { type: 'linePrefix', prefix: '1. ' } },
  {
    icon: LinkIcon,
    title: '链接',
    action: { type: 'wrap', before: '[', after: '](https://)', placeholder: '链接文字' },
  },
  { icon: Minus, title: '分割线', action: { type: 'insert', text: '\n\n---\n\n' } },
]

/**
 * 共享 Markdown 编辑器：工具栏 + 编辑/预览切换。
 * 预览仅渲染作者自己输入的内容，提交后经服务端转换为结构化 Lexical 存储。
 */
export const MarkdownEditor: React.FC<Props> = ({
  name,
  label,
  required,
  rows = 12,
  placeholder,
  description,
}) => {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState('')
  const [tab, setTab] = useState<'write' | 'preview'>('write')

  const html = useMemo(() => {
    if (tab !== 'preview') return ''
    const out = marked.parse(value || '')
    return typeof out === 'string' ? out : ''
  }, [tab, value])

  const applyTool = useCallback(
    (action: ToolAction) => {
      const el = ref.current
      if (!el) return
      const start = el.selectionStart
      const end = el.selectionEnd
      const selected = value.slice(start, end)
      let next = value
      let cursorStart = start
      let cursorEnd = end

      if (action.type === 'wrap') {
        const inner = selected || action.placeholder
        next = value.slice(0, start) + action.before + inner + action.after + value.slice(end)
        cursorStart = start + action.before.length
        cursorEnd = cursorStart + inner.length
      } else if (action.type === 'linePrefix') {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1
        next = value.slice(0, lineStart) + action.prefix + value.slice(lineStart)
        cursorStart = start + action.prefix.length
        cursorEnd = end + action.prefix.length
      } else {
        next = value.slice(0, start) + action.text + value.slice(end)
        cursorStart = cursorEnd = start + action.text.length
      }

      setValue(next)
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(cursorStart, cursorEnd)
      })
    },
    [value],
  )

  const tabClass = (active: boolean) =>
    cn(
      'rounded-md px-3 py-1 text-sm transition-colors',
      active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
    )

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        <div className="flex gap-1 rounded-md border border-border p-0.5">
          <button
            type="button"
            className={tabClass(tab === 'write')}
            onClick={() => setTab('write')}
          >
            编辑
          </button>
          <button
            type="button"
            className={tabClass(tab === 'preview')}
            onClick={() => setTab('preview')}
          >
            预览
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-input">
        {tab === 'write' && (
          <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-1">
            {TOOLS.map(({ icon: Icon, title, action }) => (
              <button
                key={title}
                type="button"
                title={title}
                aria-label={title}
                onClick={() => applyTool(action)}
                className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        )}

        <textarea
          ref={ref}
          id={name}
          name={name}
          required={required}
          rows={rows}
          placeholder={placeholder ?? '支持 Markdown：# 标题、**加粗**、- 列表、`代码` 等'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn(
            'placeholder:text-muted-foreground flex w-full resize-y bg-transparent px-3 py-2 text-sm outline-none',
            tab === 'preview' && 'hidden',
          )}
        />

        {tab === 'preview' && (
          <div
            className="prose prose-sm min-h-[12rem] max-w-none p-4 dark:prose-invert"
            // 仅渲染作者本人输入的预览内容，提交后经服务端转换为结构化 Lexical 存储。
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>

      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
