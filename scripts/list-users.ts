import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const payload = await getPayload({ config })

const users = await payload.find({ collection: 'users', limit: 100, depth: 0 })

console.log('--- USERS ---')
for (const u of users.docs) {
  console.log(`${u.email}  role=${JSON.stringify((u as any).role)}  id=${u.id}`)
}

process.exit(0)
