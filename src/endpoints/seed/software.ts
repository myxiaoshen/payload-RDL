import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'

/** 生成一段最简单的 Lexical 富文本，供 seed 数据使用 */
export const simpleRichText = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      children: [
        {
          type: 'text',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      textFormat: 0,
      version: 1,
    })),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

type SoftwareArgs = {
  thumbnail: Media
  categoryIds: number[]
}

export const software1 = ({
  thumbnail,
  categoryIds,
}: SoftwareArgs): RequiredDataFromCollectionSlug<'software'> => ({
  title: '极速下载器',
  slug: 'turbo-downloader',
  _status: 'published',
  thumbnail: thumbnail.id,
  summary: '轻量高效的多线程下载工具，支持断点续传与批量任务管理。',
  description: simpleRichText([
    '极速下载器是一款专注于速度与稳定性的下载工具，采用多线程技术充分利用带宽。',
    '支持断点续传、批量下载、下载队列管理，界面简洁易用，适合日常与重度下载场景。',
  ]),
  version: '2.1.0',
  platform: ['windows', 'macos'],
  categories: categoryIds,
  featured: true,
  downloadFiles: [
    {
      label: 'v2.1.0 Windows 64 位',
      platform: 'windows',
      fileSize: '32.5 MB',
      requiredRole: 'user',
      fileSource: 'url',
      url: 'https://example.com/download/turbo-downloader-win.exe',
    },
    {
      label: 'v2.1.0 macOS',
      platform: 'macos',
      fileSize: '28.9 MB',
      requiredRole: 'vip',
      fileSource: 'url',
      url: 'https://example.com/download/turbo-downloader-mac.dmg',
    },
  ],
})

export const software2 = ({
  thumbnail,
  categoryIds,
}: SoftwareArgs): RequiredDataFromCollectionSlug<'software'> => ({
  title: '像素图像编辑器',
  slug: 'pixel-image-editor',
  _status: 'published',
  thumbnail: thumbnail.id,
  summary: '面向创作者的跨平台图像编辑软件，内置滤镜与图层支持。',
  description: simpleRichText([
    '像素图像编辑器提供图层、蒙版、滤镜等专业级功能，同时保持轻量与流畅。',
    '跨平台支持 Windows、macOS 与 Linux，适合设计师与内容创作者快速出图。',
  ]),
  version: '5.4.2',
  platform: ['windows', 'macos', 'linux'],
  categories: categoryIds,
  featured: false,
  downloadFiles: [
    {
      label: 'v5.4.2 全平台安装包',
      platform: 'windows',
      fileSize: '96.0 MB',
      requiredRole: 'user',
      fileSource: 'url',
      url: 'https://example.com/download/pixel-editor.zip',
    },
  ],
})
