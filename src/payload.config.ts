import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Appeals } from './collections/Appeals'
import { Bounties } from './collections/Bounties'
import { BountyCategories } from './collections/BountyCategories'
import { BountySubmissions } from './collections/BountySubmissions'
import { CoinTransactions } from './collections/CoinTransactions'
import { Comments } from './collections/Comments'
import { Favorites } from './collections/Favorites'
import { MarketCategories } from './collections/MarketCategories'
import { MarketResources } from './collections/MarketResources'
import { Media } from './collections/Media'
import { Messages } from './collections/Messages'
import { Notifications } from './collections/Notifications'
import { NotificationReads } from './collections/NotificationReads'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Series } from './collections/Series'
import { Software } from './collections/Software'
import { SoftwareCategories } from './collections/SoftwareCategories'
import { Users } from './collections/Users'
import { downloadEndpoint } from './endpoints/download'
import { bountyAcceptEndpoint } from './endpoints/bounty/accept'
import { bountyCloseEndpoint } from './endpoints/bounty/close'
import { bountyPublishEndpoint } from './endpoints/bounty/publish'
import { bountySubmissionDownloadEndpoint } from './endpoints/bounty/submissionDownload'
import { bountySubmitEndpoint } from './endpoints/bounty/submit'
import { checkinEndpoint } from './endpoints/market/checkin'
import { marketPublishEndpoint } from './endpoints/market/publish'
import { purchaseEndpoint } from './endpoints/market/purchase'
import { resourceDownloadEndpoint } from './endpoints/market/resourceDownload'
import { captchaChallengeEndpoint, captchaVerifyEndpoint } from './endpoints/captcha'
import { registerEndpoint } from './endpoints/auth/register'
import { appealsCreateEndpoint } from './endpoints/appeals/create'
import { reviewAppealsEndpoint } from './endpoints/review/appeals'
import { reviewBountiesEndpoint } from './endpoints/review/bounties'
import { reviewCommentsEndpoint } from './endpoints/review/comments'
import { reviewMarketResourcesEndpoint } from './endpoints/review/marketResources'
import { reviewUsersEndpoint } from './endpoints/review/users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { HomepageHero } from './HomepageHero/config'
import { Security } from './Security/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

import { zh } from '@payloadcms/translations/languages/zh'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const databaseURL = process.env.DATABASE_URL || ''
// 根据连接串协议自动选择数据库适配器：mongodb:// 用 Mongo，其余走 Postgres。
// 迁移期间保留两种适配器，导出用 Mongo、导入用 Postgres，迁移完成后可只保留 Postgres。
const databaseAdapter = databaseURL.startsWith('mongodb')
  ? mongooseAdapter({ url: databaseURL })
  : postgresAdapter({ pool: { connectionString: databaseURL } })

export default buildConfig({
  i18n: {
    fallbackLanguage: 'zh',
    supportedLanguages: { zh },
  },
  admin: {
    avatar: {
      Component: '@/components/AdminAvatar',
    },
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // 后台管理员登录验证码：读取 Security 全局设置，开启时渲染验证码并换取 Cookie 凭证。
      afterLogin: ['@/components/AdminLoginCaptcha'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard', '@/components/MarketStats'],
      beforeNavLinks: ['@/components/AdminSiteRoutes/NavLink#SiteRoutesNavLink'],
      views: {
        siteRoutes: {
          Component: '@/components/AdminSiteRoutes#default',
          path: '/site-routes',
          meta: { title: '站点路径总览' },
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: '手机',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: '平板',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: '桌面',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: databaseAdapter,
  routes: {
    // 支持通过 ADMIN_ROUTE 环境变量自定义后台目录，默认仍是 /admin；配合 next.config.ts 的 rewrites 与 src/proxy.ts 生效。
    admin: `/${process.env.ADMIN_ROUTE || 'admin'}`,
  },
  collections: [
    Pages,
    Posts,
    Series,
    Software,
    Media,
    Categories,
    SoftwareCategories,
    Users,
    Messages,
    Comments,
    Favorites,
    Notifications,
    NotificationReads,
    MarketResources,
    MarketCategories,
    Orders,
    CoinTransactions,
    Bounties,
    BountyCategories,
    BountySubmissions,
    Appeals,
  ],
  //其他允许的域名添加位置
  cors: [getServerSideURL()].filter(Boolean),
  endpoints: [
    downloadEndpoint,
    checkinEndpoint,
    purchaseEndpoint,
    resourceDownloadEndpoint,
    marketPublishEndpoint,
    bountyPublishEndpoint,
    bountySubmitEndpoint,
    bountyAcceptEndpoint,
    bountyCloseEndpoint,
    bountySubmissionDownloadEndpoint,
    captchaChallengeEndpoint,
    captchaVerifyEndpoint,
    registerEndpoint,
    reviewUsersEndpoint,
    reviewMarketResourcesEndpoint,
    reviewBountiesEndpoint,
    reviewCommentsEndpoint,
    reviewAppealsEndpoint,
    appealsCreateEndpoint,
  ],
  globals: [Header, Footer, HomepageHero, Security],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
