export type DefaultMenuItem = {
  link: {
    type: 'custom'
    label: string
    url: string
    newTab?: boolean | null
  }
}

export type DefaultSlide = {
  type: 'image' | 'video'
  title?: string | null
  subtitle?: string | null
  image?: null
  link?: null
  videoSource?: 'url' | 'upload' | null
  videoUrl?: string | null
  videoMedia?: null
  poster?: null
  caption?: string | null
  id?: string | null
}

export const DEFAULT_MENU_ITEMS: DefaultMenuItem[] = [
  { link: { type: 'custom', label: '浏览全部软件', url: '/software' } },
  { link: { type: 'custom', label: '资源交易', url: '/market' } },
  { link: { type: 'custom', label: '任务悬赏', url: '/bounty' } },
  { link: { type: 'custom', label: '免费注册', url: '/register' } },
]

export const DEFAULT_SLIDES: DefaultSlide[] = [
  {
    type: 'image',
    title: '精选软件，一站下载',
    subtitle: '汇集常用工具与开发软件，注册账户即可获取全部版本的下载地址。',
    image: null,
    link: null,
  },
]

export const DEFAULT_AUTOPLAY = true
export const DEFAULT_AUTOPLAY_INTERVAL_MS = 5000
