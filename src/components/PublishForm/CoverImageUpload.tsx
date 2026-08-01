'use client'

import { ImagePlus, Loader2, X } from 'lucide-react'
import React, { useRef, useState } from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/utilities/ui'

type Props = {
  name: string
  label: string
  description?: string
}

/**
 * 共享封面上传：登录用户选图后上传到 media 集合，拿到 id 写入隐藏字段供父表单读取。
 */
export const CoverImageUpload: React.FC<Props> = ({ name, label, description }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mediaId, setMediaId] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('alt', file.name)
      const res = await fetch('/api/media', { method: 'POST', credentials: 'include', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.errors?.[0]?.message ?? '上传失败，请重试')
        return
      }
      const doc = data?.doc ?? data
      setMediaId(String(doc.id))
      setPreview(doc.url ?? doc.thumbnailURL ?? null)
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setUploading(false)
    }
  }

  const clear = () => {
    setMediaId('')
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <input type="hidden" name={name} value={mediaId} />

      {preview ? (
        <div className="relative size-32 overflow-hidden rounded-lg border border-border">
          {/* 预览为刚上传的图片，使用普通 img 避免额外远程域名配置。 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="封面预览" className="size-full object-cover" />
          <button
            type="button"
            onClick={clear}
            className="absolute right-1 top-1 rounded-full bg-background/80 p-1 hover:bg-background"
            aria-label="移除封面"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex size-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground',
          )}
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <ImagePlus className="size-6" />
          )}
          {uploading ? '上传中…' : '上传封面'}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
