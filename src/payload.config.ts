import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Comments } from './collections/Comments'
import { Favorites } from './collections/Favorites'
import { Media } from './collections/Media'
import { Messages } from './collections/Messages'
import { Notifications } from './collections/Notifications'
import { NotificationReads } from './collections/NotificationReads'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Series } from './collections/Series'
import { Software } from './collections/Software'
import { Users } from './collections/Users'
import { downloadEndpoint } from './endpoints/download'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
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
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
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
  collections: [
    Pages,
    Posts,
    Series,
    Software,
    Media,
    Categories,
    Users,
    Messages,
    Comments,
    Favorites,
    Notifications,
    NotificationReads,
  ],
  //其他允许的域名添加位置
  cors: [getServerSideURL()].filter(Boolean),
  endpoints: [downloadEndpoint],
  globals: [Header, Footer],
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
