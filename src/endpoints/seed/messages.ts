import type { RequiredDataFromCollectionSlug } from 'payload'

export const messages: RequiredDataFromCollectionSlug<'messages'>[] = [
  {
    name: '张三',
    email: 'zhangsan@example.com',
    subject: '软件下载问题',
    message: '你好，我在下载「极速下载器」时遇到了链接失效的问题，麻烦帮忙看一下，谢谢！',
    status: 'new',
  },
  {
    name: '李四',
    email: 'lisi@example.com',
    subject: '合作咨询',
    message: '贵站内容很棒，想咨询一下内容合作与投稿相关的事宜，期待回复。',
    status: 'resolved',
  },
]
