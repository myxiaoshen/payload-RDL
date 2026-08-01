import type { GlobalConfig } from 'payload'

import { isAdmin, isAdminFieldLevel } from '@/access/isAdmin'

export const Security: GlobalConfig = {
  slug: 'security',
  label: '安全设置',
  admin: {
    group: '系统',
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '验证码设置',
          fields: [
            {
              name: 'captchaProvider',
              type: 'select',
              label: '验证码供应商',
              defaultValue: 'builtin',
              options: [
                { label: '自建图形验证码', value: 'builtin' },
                { label: 'Cloudflare Turnstile', value: 'turnstile' },
              ],
            },
            {
              name: 'captchaSiteKey',
              type: 'text',
              label: 'Turnstile Site Key',
              admin: {
                condition: (_, siblingData) => siblingData?.captchaProvider === 'turnstile',
                description: '前端小组件使用，可公开。',
              },
            },
            {
              name: 'captchaSecretKey',
              type: 'text',
              label: 'Turnstile Secret Key',
              access: {
                read: isAdminFieldLevel,
              },
              admin: {
                condition: (_, siblingData) => siblingData?.captchaProvider === 'turnstile',
                description: '服务端校验使用，仅管理员可读，不会通过公开 API 返回。',
              },
            },
            {
              name: 'adminLoginCaptchaEnabled',
              type: 'checkbox',
              label: '后台管理员登录需要验证码',
              defaultValue: true,
            },
            {
              name: 'userLoginCaptchaEnabled',
              type: 'checkbox',
              label: '前台用户登录需要验证码',
              defaultValue: true,
            },
            {
              name: 'userRegisterCaptchaEnabled',
              type: 'checkbox',
              label: '前台用户注册需要验证码',
              defaultValue: true,
            },
            {
              name: 'contactMessageCaptchaEnabled',
              type: 'checkbox',
              label: '留言板提交需要验证码',
              defaultValue: true,
            },
          ],
        },
        {
          label: '注册与审核',
          fields: [
            {
              name: 'allowRegistration',
              type: 'checkbox',
              label: '是否开放用户注册',
              defaultValue: true,
            },
            {
              name: 'requireRegistrationApproval',
              type: 'checkbox',
              label: '新用户注册需管理员/审核员审核',
              defaultValue: false,
              admin: {
                description: '开启后，新注册用户需审核通过才能登录。',
              },
            },
          ],
        },
        {
          label: '后台管理员目录',
          fields: [
            {
              name: 'adminRouteInfo',
              type: 'ui',
              label: '当前后台目录',
              admin: {
                // 仅管理员可见，审核员及其他角色完全看不到这一栏。
                condition: (_data, _siblingData, { user }) => user?.role === 'admin',
                components: {
                  Field: '@/Security/AdminRouteInfo#AdminRouteInfoField',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
