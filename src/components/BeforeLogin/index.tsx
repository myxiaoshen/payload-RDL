import React from 'react'

const BeforeLogin: React.FC = () => {
  return (
    <div>
      <p>
        <b>管理后台</b>
        {' 仅限管理员登录。普通用户请前往 '}
        <a href="/login">前台登录页</a>
        {' 。'}
      </p>
    </div>
  )
}

export default BeforeLogin
