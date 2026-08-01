import React from 'react'

/** 只读展示当前生效的后台目录；修改需改 .env 的 ADMIN_ROUTE 并重启服务。 */
export const AdminRouteInfoField: React.FC = () => {
  const adminRoute = process.env.ADMIN_ROUTE || 'admin'

  return (
    <div style={{ padding: '8px 0 20px' }}>
      <p style={{ margin: 0 }}>
        当前生效的后台管理目录：<code>/{adminRoute}</code>
      </p>
      <p style={{ color: 'var(--theme-elevation-500)', fontSize: 13, marginTop: 6 }}>
        修改方法：编辑项目根目录 .env 文件中的 ADMIN_ROUTE 变量，重启服务后生效（无需重新构建）。
      </p>
    </div>
  )
}

export default AdminRouteInfoField
