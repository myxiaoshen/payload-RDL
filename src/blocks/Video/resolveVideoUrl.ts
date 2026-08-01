export type ResolvedVideo =
  | { kind: 'iframe'; src: string; title: string }
  | { kind: 'file'; src: string }
  | null

const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']
const BILIBILI_HOSTS = ['bilibili.com', 'www.bilibili.com', 'm.bilibili.com', 'player.bilibili.com']
const VIMEO_HOSTS = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']

const ID_PATTERN = /^[A-Za-z0-9_-]{5,64}$/
const NUMERIC_PATTERN = /^[0-9]{5,20}$/

/**
 * 只从白名单站点提取纯净的视频 ID 再拼接播放器地址，避免把用户输入直接塞进 iframe src。
 */
export const resolveVideoUrl = (rawUrl: string | null | undefined): ResolvedVideo => {
  if (!rawUrl) return null

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

  const host = url.hostname.toLowerCase()
  const segments = url.pathname.split('/').filter(Boolean)

  if (YOUTUBE_HOSTS.includes(host)) {
    const id =
      host === 'youtu.be'
        ? segments[0]
        : url.searchParams.get('v') ||
          (segments[0] === 'embed' || segments[0] === 'shorts' ? segments[1] : undefined)

    if (id && ID_PATTERN.test(id)) {
      return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${id}`, title: 'YouTube' }
    }
    return null
  }

  if (BILIBILI_HOSTS.includes(host)) {
    const bvid = url.searchParams.get('bvid') || segments.find((s) => /^BV[A-Za-z0-9]{8,12}$/.test(s))
    if (bvid && /^BV[A-Za-z0-9]{8,12}$/.test(bvid)) {
      const page = url.searchParams.get('p')
      const pageParam = page && /^[0-9]{1,3}$/.test(page) ? `&p=${page}` : ''
      return {
        kind: 'iframe',
        src: `https://player.bilibili.com/player.html?bvid=${bvid}&high_quality=1&autoplay=0${pageParam}`,
        title: 'Bilibili',
      }
    }
    return null
  }

  if (VIMEO_HOSTS.includes(host)) {
    const id = segments.find((s) => NUMERIC_PATTERN.test(s))
    if (id) {
      return { kind: 'iframe', src: `https://player.vimeo.com/video/${id}`, title: 'Vimeo' }
    }
    return null
  }

  return { kind: 'file', src: url.toString() }
}

export const ASPECT_RATIO_CLASS: Record<string, string> = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '9/16': 'aspect-[9/16] mx-auto max-w-sm',
}
