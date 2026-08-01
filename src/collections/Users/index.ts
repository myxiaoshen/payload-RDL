import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin, isAdminBoolean, isAdminFieldLevel } from '../../access/isAdmin'
import { getSecuritySettings, verifyCaptchaTicket } from '@/utilities/captcha'

type UserContext = { skipCoinLog?: boolean; skipLoginCaptcha?: boolean }

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: '用户',
    plural: '用户',
  },
  access: {
    admin: isAdminBoolean,
    create: async ({ req }) => {
      const settings = await getSecuritySettings(req.payload)
      return settings.allowRegistration !== false
    },
    delete: isAdmin,
    read: authenticated,
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return user.id === id
    },
  },
  admin: {
    group: '系统',
    defaultColumns: ['name', 'email', 'role', 'status'],
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '姓名',
    },
    {
      name: 'role',
      type: 'select',
      label: '角色',
      defaultValue: 'user',
      options: [
        { label: '普通用户', value: 'user' },
        { label: 'VIP 用户', value: 'vip' },
        { label: '审核员', value: 'reviewer' },
        { label: '管理员', value: 'admin' },
      ],
      access: {
        create: isAdminFieldLevel,
        update: isAdminFieldLevel,
      },
    },
    {
      name: 'status',
      type: 'select',
      label: '账号状态',
      defaultValue: 'approved',
      options: [
        { label: '待审核', value: 'pending' },
        { label: '已通过', value: 'approved' },
        { label: '已拒绝', value: 'rejected' },
      ],
      access: {
        // 日常改状态走 /api/review/users 审核端点（overrideAccess）；管理员也可在后台直接改。
        update: isAdminFieldLevel,
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'captchaTicket',
      type: 'text',
      label: '验证码凭证',
      virtual: true,
      access: {
        read: () => false,
      },
      admin: {
        hidden: true,
        description: '仅注册提交时临时使用，不落库。',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      label: '头像',
      relationTo: 'media',
    },
    {
      name: 'coinBalance',
      type: 'number',
      label: '平台币余额',
      defaultValue: 0,
      min: 0,
      access: {
        // 普通用户不可自行修改余额；管理员可在后台直接发放。
        update: isAdminFieldLevel,
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'totalEarnings',
      type: 'number',
      label: '累计收益',
      defaultValue: 0,
      access: {
        // 由销售结算自动累加，避免个人中心全量扫描流水求和。
        update: isAdminFieldLevel,
      },
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'lastSigninAt',
      type: 'date',
      label: '最近签到时间',
      access: {
        update: () => false,
      },
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== 'create' || !data) return data

        const settings = await getSecuritySettings(req.payload)
        const createdByStaff = req.user?.role === 'admin' || req.user?.role === 'reviewer'

        // 自助注册（非后台/审核员创建）按开关校验验证码。
        if (!createdByStaff && settings.userRegisterCaptchaEnabled !== false) {
          if (!verifyCaptchaTicket(data.captchaTicket as string | undefined, 'user-register')) {
            throw new Error('请先完成验证码验证')
          }
        }

        // 后台/审核员创建的账号无需审核；自助注册按「是否需审核」开关决定初始状态。
        if (!data.status) {
          data.status =
            !createdByStaff && settings.requireRegistrationApproval ? 'pending' : 'approved'
        }

        delete data.captchaTicket

        return data
      },
    ],
    beforeLogin: [
      async ({ context, req, user }) => {
        if (user.status && user.status !== 'approved') {
          throw new Error('账号审核中，请等待审核通过后再登录')
        }

        // 注册成功后由 /api/auth/register 端点内部直接登录，其注册验证码已经证明过是人，跳过重复校验。
        if ((context as UserContext)?.skipLoginCaptcha) return user

        const settings = await getSecuritySettings(req.payload)

        if (user.role === 'admin') {
          if (settings.adminLoginCaptchaEnabled === false) return user
          const cookieHeader = req.headers.get('cookie') ?? ''
          const match = cookieHeader.match(/(?:^|;\s*)admin_captcha_ticket=([^;]+)/)
          const ticket = match ? decodeURIComponent(match[1]) : undefined
          if (!verifyCaptchaTicket(ticket, 'admin-login')) {
            throw new Error('请先完成后台登录验证码验证')
          }
          return user
        }

        if (settings.userLoginCaptchaEnabled === false) return user
        const ticket = (req.data as Record<string, unknown> | undefined)?.captchaTicket as
          string | undefined
        if (!verifyCaptchaTicket(ticket, 'user-login')) {
          throw new Error('请先完成验证码验证')
        }
        return user
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req, operation, context }) => {
        // 管理员在后台直接调整余额时补记一条流水；端点内改动已自行记账（skipCoinLog）。
        if (operation !== 'update') return doc
        if ((context as UserContext)?.skipCoinLog) return doc
        if (req.user?.role !== 'admin') return doc

        const before = previousDoc?.coinBalance ?? 0
        const after = doc?.coinBalance ?? 0
        const delta = after - before
        if (delta === 0) return doc

        await req.payload.create({
          collection: 'coin-transactions',
          data: {
            user: doc.id,
            amount: delta,
            balanceAfter: after,
            type: 'admin-adjust',
            note: '管理员调整',
          },
          depth: 0,
          overrideAccess: true,
          req,
          context: { disableRevalidate: true },
        })

        return doc
      },
    ],
  },
  timestamps: true,
}
