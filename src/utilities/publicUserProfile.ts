import type { Payload, PayloadRequest } from 'payload'

import { getMediaUrl } from '@/utilities/getMediaUrl'

export type PublicUserProfile = {
  id: number | string
  displayName: string
  /** 公开可访问的头像 URL；无头像时为 null。 */
  avatarUrl?: string | null
}

type AvatarMedia = {
  url?: string | null
  updatedAt?: string | null
  externalUrl?: string | null
}

/** 关系字段可能是 id 或已 populate 的对象，统一取 id。 */
export const relationId = (value: unknown): number | string | null => {
  if (value == null) return null
  return typeof value === 'object'
    ? ((value as { id?: number | string | null }).id ?? null)
    : (value as number | string)
}

/** 公开显示名：有 name 用 name，否则 `用户{id}`；永不回退 email。 */
export const formatPublicDisplayName = (id: number | string, name?: string | null): string => {
  const trimmed = typeof name === 'string' ? name.trim() : ''
  return trimmed || `用户${id}`
}

const resolveAvatarUrl = (avatar: unknown): string | null => {
  if (!avatar || typeof avatar !== 'object') return null
  const media = avatar as AvatarMedia
  if (media.externalUrl) return media.externalUrl
  const url = getMediaUrl(media.url, media.updatedAt)
  return url || null
}

/**
 * 批量解析用户公开资料（id / displayName / avatarUrl）。
 * 使用 overrideAccess，仅映射安全字段，不暴露 email/role/余额。
 */
export const resolvePublicUserProfiles = async (
  payload: Payload,
  refs: unknown[],
  options?: { req?: PayloadRequest },
): Promise<Map<string, PublicUserProfile>> => {
  const result = new Map<string, PublicUserProfile>()
  const ids = Array.from(
    new Set(
      refs
        .map((ref) => relationId(ref))
        .filter((id): id is number | string => id != null && id !== ''),
    ),
  ).map(String)

  if (ids.length === 0) return result

  const { docs } = await payload.find({
    collection: 'users',
    where: { id: { in: ids } },
    depth: 1,
    limit: ids.length,
    pagination: false,
    overrideAccess: true,
    req: options?.req,
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  })

  for (const doc of docs) {
    const id = doc.id
    const key = String(id)
    result.set(key, {
      id,
      displayName: formatPublicDisplayName(id, doc.name),
      avatarUrl: resolveAvatarUrl(doc.avatar),
    })
  }

  // 对查不到的 id 仍给出稳定占位，避免 UI 再回退「匿名」。
  for (const id of ids) {
    if (!result.has(id)) {
      result.set(id, {
        id,
        displayName: formatPublicDisplayName(id),
        avatarUrl: null,
      })
    }
  }

  return result
}

/** 解析单个用户公开资料。 */
export const resolvePublicUserProfile = async (
  payload: Payload,
  ref: unknown,
  options?: { req?: PayloadRequest },
): Promise<PublicUserProfile | null> => {
  const id = relationId(ref)
  if (id == null) return null
  const map = await resolvePublicUserProfiles(payload, [id], options)
  return map.get(String(id)) ?? null
}
