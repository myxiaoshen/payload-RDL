'use client'

import React, { useState } from 'react'

import { CaptchaWidget } from '@/components/CaptchaWidget'
import { useSecuritySettings } from '@/utilities/useSecuritySettings'

/** 挂载在 admin.components.afterLogin：验证通过后由 /api/captcha/verify 下发 httpOnly Cookie，供 Users.beforeLogin 读取。 */
const AdminLoginCaptcha: React.FC = () => {
  const settings = useSecuritySettings()
  const [verified, setVerified] = useState(false)

  if (settings?.adminLoginCaptchaEnabled !== true) return null

  return (
    <div style={{ margin: '16px 0' }}>
      <CaptchaWidget
        onReset={() => setVerified(false)}
        onVerified={() => setVerified(true)}
        scope="admin-login"
      />
      {verified && (
        <p style={{ color: '#27ae60', fontSize: 13 }}>验证通过，请继续输入邮箱和密码登录</p>
      )}
    </div>
  )
}

export default AdminLoginCaptcha
