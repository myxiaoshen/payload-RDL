import fs from 'fs'
import path from 'path'

/** 单个 API 端点的调用说明，供后台开发者对接参考。 */
export type ApiEndpoint = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  /** 相对站点根路径，动态片段用 {xxx} 占位 */
  path: string
  description: string
  /** 权限要求，缺省视为公开可访问 */
  auth?: string
}

export type SiteRoute = {
  /** 前台 URL 路径，动态段保留 [param] 形式 */
  path: string
  label: string
  group: string
  /** 动态路由的数据来源集合，用于在后台统计条目数并跳转 */
  collection?: string
  /** 统计该集合条目数时附加的筛选条件 */
  where?: Record<string, unknown>
  dynamic: boolean
  /** 未在下方登记表中出现的新增路由 */
  unregistered: boolean
  /** 该页面实际调用的 API 端点，供「API」按钮展示 */
  api: ApiEndpoint[]
}

type RouteMeta = {
  label: string
  group: string
  collection?: string
  where?: Record<string, unknown>
  api?: ApiEndpoint[]
}

/**
 * 路由说明登记表。新增页面后若忘记登记，总览页会把它标为「未登记」提醒补充。
 */
const ROUTE_META: Record<string, RouteMeta> = {
  '/': { label: '网站首页', group: '基础页面' },
  '/search': {
    label: '全站搜索',
    group: '基础页面',
    api: [
      {
        method: 'GET',
        path: '/api/search?where[title][contains]={关键词}&limit=10',
        description: '全站聚合搜索（文章/软件/页面），数据来自 search 插件自动同步的索引集合',
      },
    ],
  },
  '/contact': {
    label: '联系我们',
    group: '基础页面',
    api: [{ method: 'POST', path: '/api/messages', description: '提交联系表单留言' }],
  },
  '/login': {
    label: '登录',
    group: '用户中心',
    api: [
      {
        method: 'POST',
        path: '/api/users/login',
        description: '邮箱+密码登录，成功后写入 HttpOnly 登录态 Cookie',
      },
    ],
  },
  '/register': {
    label: '注册',
    group: '用户中心',
    api: [
      { method: 'POST', path: '/api/users', description: '创建新用户（注册）' },
      { method: 'POST', path: '/api/users/login', description: '注册成功后自动登录' },
    ],
  },
  '/account': {
    label: '我的账户',
    group: '用户中心',
    api: [
      { method: 'GET', path: '/api/users/me', description: '获取当前登录用户信息', auth: '需登录' },
      {
        method: 'PATCH',
        path: '/api/users/{id}',
        description: '更新昵称/头像等个人资料',
        auth: '需登录（本人）',
      },
      { method: 'POST', path: '/api/users/logout', description: '退出登录', auth: '需登录' },
      {
        method: 'POST',
        path: '/api/market/checkin',
        description: '每日签到领取平台币',
        auth: '需登录',
      },
      {
        method: 'GET',
        path: '/api/orders?depth=1&sort=-createdAt',
        description: '我的订单列表',
        auth: '需登录',
      },
      {
        method: 'GET',
        path: '/api/favorites?depth=1&sort=-createdAt',
        description: '我的收藏列表',
        auth: '需登录',
      },
      {
        method: 'GET',
        path: '/api/comments?depth=1&sort=-createdAt',
        description: '我的评论列表',
        auth: '需登录',
      },
      {
        method: 'GET',
        path: '/api/coin-transactions?sort=-createdAt',
        description: '我的平台币流水',
        auth: '需登录',
      },
      {
        method: 'GET',
        path: '/api/bounties?where[author][equals]={userId}',
        description: '我发布的悬赏',
        auth: '需登录',
      },
      {
        method: 'GET',
        path: '/api/bounty-submissions?depth=1&sort=-createdAt',
        description: '我参与的悬赏提交',
        auth: '需登录',
      },
      {
        method: 'GET',
        path: '/api/market-resources?where[author][equals]={userId}',
        description: '我发布的交易资源',
        auth: '需登录',
      },
    ],
  },
  '/review': {
    label: '内容审核',
    group: '用户中心',
    api: [
      {
        method: 'POST',
        path: '/api/review/users',
        description: '审核待通过的注册用户（approve/reject）',
        auth: '需审核员或管理员',
      },
      {
        method: 'POST',
        path: '/api/review/market-resources',
        description: '审核待上架的市场资源（approve/reject）',
        auth: '需审核员或管理员',
      },
      {
        method: 'POST',
        path: '/api/review/bounties',
        description: '审核待发布的悬赏任务（approve/reject）',
        auth: '需审核员或管理员',
      },
      {
        method: 'POST',
        path: '/api/review/comments',
        description: '审核待通过的评论（approve/reject）',
        auth: '需审核员或管理员',
      },
    ],
  },
  '/vip': { label: 'VIP 会员介绍', group: '用户中心' },
  '/[slug]': {
    label: 'CMS 自定义页面',
    group: '基础页面',
    collection: 'pages',
    where: { _status: { equals: 'published' } },
    api: [
      {
        method: 'GET',
        path: '/api/pages?where[slug][equals]={slug}&where[_status][equals]=published&depth=2',
        description: '按 slug 查询已发布 CMS 页面详情',
      },
    ],
  },
  '/posts': {
    label: '文章列表',
    group: '内容',
    api: [
      {
        method: 'GET',
        path: '/api/posts?where[_status][equals]=published&sort=-publishedAt&limit=12&page={page}',
        description: '文章列表分页查询',
      },
    ],
  },
  '/posts/page/[pageNumber]': {
    label: '文章列表分页',
    group: '内容',
    api: [
      {
        method: 'GET',
        path: '/api/posts?where[_status][equals]=published&sort=-publishedAt&limit=12&page={pageNumber}',
        description: '文章列表指定页码',
      },
    ],
  },
  '/posts/[slug]': {
    label: '文章详情',
    group: '内容',
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    api: [
      {
        method: 'GET',
        path: '/api/posts?where[slug][equals]={slug}&where[_status][equals]=published&depth=2',
        description: '按 slug 查询已发布文章详情',
      },
      {
        method: 'GET',
        path: '/api/comments?where[relatedTo.value][equals]={id}&where[relatedTo.relationTo][equals]=posts&depth=1',
        description: '查询该文章下的评论',
      },
      { method: 'POST', path: '/api/comments', description: '发表评论', auth: '需登录' },
      { method: 'POST', path: '/api/favorites', description: '收藏该文章', auth: '需登录' },
    ],
  },
  '/software': {
    label: '软件列表',
    group: '内容',
    api: [
      {
        method: 'GET',
        path: '/api/software?where[_status][equals]=published&sort=-publishedAt&limit=12&page={page}',
        description: '软件列表分页查询',
      },
    ],
  },
  '/software/[slug]': {
    label: '软件详情',
    group: '内容',
    collection: 'software',
    where: { _status: { equals: 'published' } },
    api: [
      {
        method: 'GET',
        path: '/api/software?where[slug][equals]={slug}&where[_status][equals]=published&depth=2',
        description: '按 slug 查询已发布软件详情',
      },
      {
        method: 'POST',
        path: '/api/download',
        description: '解析真实下载地址并计数（按角色校验下载项权限）',
        auth: '需登录',
      },
      {
        method: 'GET',
        path: '/api/comments?where[relatedTo.value][equals]={id}&where[relatedTo.relationTo][equals]=software&depth=1',
        description: '查询该软件下的评论',
      },
      { method: 'POST', path: '/api/favorites', description: '收藏该软件', auth: '需登录' },
    ],
  },
  '/topics': {
    label: '专题列表',
    group: '内容',
    api: [
      {
        method: 'GET',
        path: '/api/series?sort=-createdAt&limit=12&page={page}',
        description: '专题列表分页查询',
      },
    ],
  },
  '/topics/[slug]': {
    label: '专题详情',
    group: '内容',
    collection: 'series',
    api: [
      {
        method: 'GET',
        path: '/api/series?where[slug][equals]={slug}&depth=2',
        description: '按 slug 查询专题详情（含其下文章 posts 字段）',
      },
    ],
  },
  '/categories/[slug]': {
    label: '分类归档',
    group: '内容',
    collection: 'categories',
    api: [
      {
        method: 'GET',
        path: '/api/categories?where[slug][equals]={slug}',
        description: '按 slug 查询分类详情',
      },
      {
        method: 'GET',
        path: '/api/posts?where[categories][in]={categoryId}&where[_status][equals]=published',
        description: '查询该分类下的已发布文章',
      },
    ],
  },
  '/market': {
    label: '资源交易区列表',
    group: '交易市场',
    api: [
      {
        method: 'GET',
        path: '/api/market-resources?where[status][equals]=approved&sort=-createdAt&limit=12&page={page}',
        description: '已上架交易资源列表分页查询',
      },
    ],
  },
  '/market/publish': {
    label: '发布交易资源',
    group: '交易市场',
    api: [
      {
        method: 'POST',
        path: '/api/market/publish',
        description: '发布交易资源（自动转换 Markdown 详情，进入待审核状态）',
        auth: '需登录',
      },
    ],
  },
  '/market/[slug]': {
    label: '交易资源详情',
    group: '交易市场',
    collection: 'market-resources',
    where: { status: { equals: 'approved' } },
    api: [
      {
        method: 'GET',
        path: '/api/market-resources?where[slug][equals]={slug}&where[status][equals]=approved&depth=2',
        description: '按 slug 查询已上架交易资源详情',
      },
      {
        method: 'POST',
        path: '/api/market/purchase',
        description: '购买资源（原子扣币、结算给作者、生成订单、累加销量）',
        auth: '需登录',
      },
      {
        method: 'POST',
        path: '/api/market/resource-download',
        description: '获取已购资源的真实下载地址',
        auth: '需登录（已购买/作者/管理员）',
      },
    ],
  },
  '/bounty': {
    label: '悬赏列表',
    group: '交易市场',
    api: [
      {
        method: 'GET',
        path: '/api/bounties?sort=-createdAt&limit=12&page={page}',
        description: '悬赏列表分页查询',
      },
    ],
  },
  '/bounty/publish': {
    label: '发布悬赏',
    group: '交易市场',
    api: [
      {
        method: 'POST',
        path: '/api/bounty/publish',
        description: '发布悬赏（校验余额后原子创建悬赏并冻结悬赏币，待审核）',
        auth: '需登录',
      },
    ],
  },
  '/bounty/[slug]': {
    label: '悬赏详情',
    group: '交易市场',
    collection: 'bounties',
    api: [
      {
        method: 'GET',
        path: '/api/bounties?where[slug][equals]={slug}&depth=2',
        description: '按 slug 查询悬赏详情',
      },
      {
        method: 'POST',
        path: '/api/bounty/submit',
        description: '提交悬赏方案',
        auth: '需登录',
      },
      {
        method: 'POST',
        path: '/api/bounty/accept',
        description: '发起人采纳提交，原子发放悬赏并标记完成',
        auth: '需登录（发起人）',
      },
      {
        method: 'POST',
        path: '/api/bounty/close',
        description: '关闭/驳回悬赏，原子退回冻结的悬赏币',
        auth: '需登录（发起人/管理员）',
      },
      {
        method: 'POST',
        path: '/api/bounty/submission-download',
        description: '获取已采纳方案的真实下载地址',
        auth: '需登录（发起人/提交者/管理员）',
      },
    ],
  },
}

const GROUP_ORDER = ['基础页面', '内容', '交易市场', '用户中心', '未分组']

/** 源码目录不可用时（如 standalone 构建）退回到这份快照。 */
const FALLBACK_PATHS = Object.keys(ROUTE_META)

const FRONTEND_DIR = path.join(process.cwd(), 'src', 'app', '(frontend)')

const collectRoutePaths = (dir: string, segments: string[], found: string[]): void => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue

    const { name } = entry
    if (name.startsWith('_') || name.startsWith('@') || name.startsWith('.')) continue

    const child = path.join(dir, name)
    // 括号目录是 Next.js 的路由分组，不参与 URL 拼接
    const nextSegments = name.startsWith('(') && name.endsWith(')') ? segments : [...segments, name]

    if (fs.existsSync(path.join(child, 'page.tsx'))) {
      found.push(`/${nextSegments.join('/')}`)
    }

    collectRoutePaths(child, nextSegments, found)
  }
}

const scanRoutePaths = (): string[] => {
  try {
    const found: string[] = []
    if (fs.existsSync(path.join(FRONTEND_DIR, 'page.tsx'))) found.push('/')
    collectRoutePaths(FRONTEND_DIR, [], found)
    return found.length > 0 ? found : FALLBACK_PATHS
  } catch {
    return FALLBACK_PATHS
  }
}

/** 扫描 app 目录得到全部前台页面路由，并附带中文说明与数据来源。 */
export const getSiteRoutes = (): SiteRoute[] => {
  const routes = scanRoutePaths().map<SiteRoute>((routePath) => {
    const meta = ROUTE_META[routePath]
    return {
      path: routePath,
      label: meta?.label ?? '未登记页面',
      group: meta?.group ?? '未分组',
      collection: meta?.collection,
      where: meta?.where,
      dynamic: routePath.includes('['),
      unregistered: !meta,
      api: meta?.api ?? [],
    }
  })

  return routes.sort((a, b) => {
    const groupDiff = GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group)
    if (groupDiff !== 0) return groupDiff
    return a.path.localeCompare(b.path)
  })
}

/** 按分组归拢，供后台总览页渲染。 */
export const groupSiteRoutes = (routes: SiteRoute[]): { group: string; routes: SiteRoute[] }[] => {
  const map = new Map<string, SiteRoute[]>()
  for (const route of routes) {
    const list = map.get(route.group) ?? []
    list.push(route)
    map.set(route.group, list)
  }
  return [...map.entries()].map(([group, groupRoutes]) => ({ group, routes: groupRoutes }))
}

/** 没有独立前台页面、仅存在于后台的集合，补充展示在总览页下方，避免被忽略。 */
export type AdminOnlyCollection = {
  slug: string
  label: string
  api: ApiEndpoint[]
}

const ADMIN_ONLY_COLLECTIONS: AdminOnlyCollection[] = [
  {
    slug: 'media',
    label: '媒体库',
    api: [
      { method: 'GET', path: '/api/media', description: '查询媒体资源列表' },
      {
        method: 'POST',
        path: '/api/media',
        description: '上传媒体文件（multipart/form-data）',
        auth: '需登录',
      },
    ],
  },
  {
    slug: 'users',
    label: '用户',
    api: [
      { method: 'GET', path: '/api/users/me', description: '获取当前登录用户信息', auth: '需登录' },
      { method: 'POST', path: '/api/users/login', description: '登录' },
      { method: 'POST', path: '/api/users/logout', description: '退出登录', auth: '需登录' },
      {
        method: 'PATCH',
        path: '/api/users/{id}',
        description: '更新用户信息',
        auth: '需登录（本人/管理员）',
      },
    ],
  },
  {
    slug: 'messages',
    label: '在线留言',
    api: [
      { method: 'POST', path: '/api/messages', description: '提交联系表单留言' },
      { method: 'GET', path: '/api/messages', description: '查询留言列表', auth: '需管理员' },
    ],
  },
  {
    slug: 'comments',
    label: '评论',
    api: [
      {
        method: 'GET',
        path: '/api/comments?where[relatedTo.value][equals]={id}&where[relatedTo.relationTo][equals]=posts',
        description: '按评论对象查询评论列表',
      },
      { method: 'POST', path: '/api/comments', description: '发表评论', auth: '需登录' },
      {
        method: 'DELETE',
        path: '/api/comments/{id}',
        description: '删除评论',
        auth: '需登录（本人/管理员）',
      },
    ],
  },
  {
    slug: 'favorites',
    label: '收藏',
    api: [
      {
        method: 'GET',
        path: '/api/favorites?depth=1&sort=-createdAt',
        description: '我的收藏列表',
        auth: '需登录',
      },
      { method: 'POST', path: '/api/favorites', description: '新增收藏', auth: '需登录' },
      {
        method: 'DELETE',
        path: '/api/favorites/{id}',
        description: '取消收藏',
        auth: '需登录（本人）',
      },
    ],
  },
  {
    slug: 'notifications',
    label: '通知',
    api: [
      {
        method: 'GET',
        path: '/api/notifications?sort=-createdAt',
        description: '查询通知列表',
        auth: '需登录',
      },
    ],
  },
  {
    slug: 'notification-reads',
    label: '通知已读记录',
    api: [
      {
        method: 'GET',
        path: '/api/notification-reads?where[user][equals]={userId}',
        description: '查询用户通知已读记录',
        auth: '需登录',
      },
    ],
  },
  {
    slug: 'market-categories',
    label: '商品分类',
    api: [{ method: 'GET', path: '/api/market-categories', description: '查询交易市场分类列表' }],
  },
  {
    slug: 'orders',
    label: '订单',
    api: [
      {
        method: 'GET',
        path: '/api/orders?depth=1&sort=-createdAt',
        description: '我的订单列表',
        auth: '需登录',
      },
    ],
  },
  {
    slug: 'coin-transactions',
    label: '平台币流水',
    api: [
      {
        method: 'GET',
        path: '/api/coin-transactions?sort=-createdAt',
        description: '我的平台币流水',
        auth: '需登录',
      },
    ],
  },
  {
    slug: 'software-categories',
    label: '软件分类',
    api: [{ method: 'GET', path: '/api/software-categories', description: '查询软件分类列表' }],
  },
  {
    slug: 'bounty-categories',
    label: '悬赏分类',
    api: [{ method: 'GET', path: '/api/bounty-categories', description: '查询悬赏分类列表' }],
  },
  {
    slug: 'bounty-submissions',
    label: '悬赏提交',
    api: [
      {
        method: 'GET',
        path: '/api/bounty-submissions?depth=1&sort=-createdAt',
        description: '查询悬赏提交列表',
        auth: '需登录',
      },
      { method: 'POST', path: '/api/bounty/submit', description: '提交悬赏方案', auth: '需登录' },
    ],
  },
]

/** 供总览页渲染「无独立前台页面的后台集合」补充区块。 */
export const getAdminOnlyCollections = (): AdminOnlyCollection[] => ADMIN_ONLY_COLLECTIONS
