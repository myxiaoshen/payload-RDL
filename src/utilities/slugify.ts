/**
 * Unicode 友好的 slug 生成。
 * Payload 内置 slugify 用 `[^\w-]` 过滤，会把中文标题整段清空，导致必填的 slug 校验失败。
 */
export const slugify = (value?: unknown): string => {
  if (typeof value !== 'string') return ''

  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}
