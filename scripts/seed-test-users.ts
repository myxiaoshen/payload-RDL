import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const payload = await getPayload({ config })

const accounts = [
  { email: 'e2e-admin@example.com', name: 'E2E 管理员', role: 'admin' as const },
  { email: 'e2e-member@example.com', name: 'E2E 会员', role: 'user' as const },
]

for (const acc of accounts) {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: acc.email } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: { role: acc.role, password: 'Test1234!' },
      overrideAccess: true,
    })
    console.log(`updated ${acc.email} (${acc.role})`)
  } else {
    await payload.create({
      collection: 'users',
      data: { ...acc, password: 'Test1234!' },
      overrideAccess: true,
    })
    console.log(`created ${acc.email} (${acc.role})`)
  }
}

process.exit(0)
