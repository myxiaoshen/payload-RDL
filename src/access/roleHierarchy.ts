import type { User } from '@/payload-types'

export type UserRole = NonNullable<User['role']>

/** 角色权限等级：数值越大权限越高。用于逐文件下载权限判定。 */
export const ROLE_LEVEL: Record<UserRole, number> = {
  user: 0,
  vip: 1,
  admin: 2,
}

export const ROLE_LABEL: Record<UserRole, string> = {
  user: '普通用户',
  vip: 'VIP 用户',
  admin: '管理员',
}

/** 当前角色是否满足所需角色等级（user < vip < admin）。 */
export const hasRoleLevel = (
  userRole: UserRole | null | undefined,
  requiredRole: UserRole | null | undefined,
): boolean => {
  const userLevel = ROLE_LEVEL[userRole ?? 'user'] ?? 0
  const requiredLevel = ROLE_LEVEL[requiredRole ?? 'user'] ?? 0
  return userLevel >= requiredLevel
}
