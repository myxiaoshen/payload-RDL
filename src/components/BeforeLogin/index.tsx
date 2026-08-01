import React from 'react'

const BeforeLogin: React.FC = () => {
  const adminRoute = process.env.ADMIN_ROUTE || 'admin'

  return (
    <div>
      <p>
        <b>管理后台</b>
        {' 仅限管理员登录。普通用户请前往 '}
        <a href="/login">前台登录页</a>
        {` 。当前后台目录：/${adminRoute}`}
      </p>
    </div>
  )
}

export default BeforeLogin
