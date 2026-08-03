'use client'

import { useField } from '@payloadcms/ui'
import React, { useRef, useState } from 'react'

/** 读取本地 .html 文件内容并写入同级的 htmlContent 源码框，避免额外的媒体上传流程。 */
export const HtmlUploadButton: React.FC = () => {
  const { setValue } = useField<string>({ path: 'htmlContent' })
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string>('')

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setValue(text)
    setFileName(file.name)
    // 允许重复上传同一个文件。
    event.target.value = ''
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <input
        ref={inputRef}
        type="file"
        accept=".html,.htm,text/html"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <button
        type="button"
        className="btn btn--style-secondary btn--size-small"
        onClick={() => inputRef.current?.click()}
      >
        上传 HTML 文件
      </button>
      {fileName && (
        <span style={{ marginLeft: 8, color: 'var(--theme-elevation-500)', fontSize: 13 }}>
          已导入：{fileName}
        </span>
      )}
    </div>
  )
}

export default HtmlUploadButton
