import type { PayloadRequest } from 'payload'

type NotifyInput = {
  userId: number | string
  title: string
  message: string
  link?: string
}

/** 创建一条定向通知（仅指定用户可见），失败不抛出以免影响主流程。 */
export const notifyUser = async (
  req: PayloadRequest,
  { userId, title, message, link }: NotifyInput,
): Promise<void> => {
  try {
    await req.payload.create({
      collection: 'notifications',
      data: {
        user: userId as number,
        title,
        message,
        audience: 'user',
        isActive: true,
        ...(link ? { link } : {}),
      },
      depth: 0,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
  } catch (err) {
    req.payload.logger.error(`notifyUser 失败: ${(err as Error).message}`)
  }
}
