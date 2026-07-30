import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const email = process.argv[2]

if (!email) {
  console.error('用法: npx tsx scripts/set-admin.ts <email>')
  process.exit(1)
}

const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'users',
  where: { email: { equals: email } },
  limit: 1,
  depth: 0,
})

if (docs.length === 0) {
  console.error(`未找到用户: ${email}`)
  process.exit(1)
}

await payload.update({
  collection: 'users',
  id: docs[0].id,
  data: { role: 'admin' },
  overrideAccess: true,
})

console.log(`已将 ${email} 设为管理员`)
process.exit(0)
