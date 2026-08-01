import { randomBytes } from 'node:crypto'

/** 统一生成短随机 slug，避免依赖标题联动。 */
export const generateRandomSlug = (): string => `rdl-${randomBytes(6).toString('hex')}`
