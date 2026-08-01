import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_ROUTE = process.env.ADMIN_ROUTE || 'admin'

/** 自定义后台目录启用时，禁止直接访问真实的 /admin 物理路径，避免路径被猜到。 */
export function proxy(_req: NextRequest) {
  if (ADMIN_ROUTE === 'admin') return NextResponse.next()

  return new NextResponse('Not Found', { status: 404 })
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
