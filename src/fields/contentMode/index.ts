import type { Field } from 'payload'

/** 正文内容类型：富文本 / 纯 Markdown / HTML。三者互斥，前台按此字段选择渲染方式。 */
export type ContentType = 'richText' | 'markdown' | 'html'

/** HTML 显示方式：页面内嵌套 / 整页完全覆盖。 */
export type HtmlDisplayMode = 'embed' | 'fullscreen'

type ContentTypeArgs = {
  /** richText 选项的展示名称（Posts 为「富文本编辑器」，Pages 为「板块布局」）。 */
  richTextLabel: string
}

/** 兼容历史数据：contentType 缺省时视为富文本 / 板块布局。 */
export const isRichTextMode = (_data: unknown, siblingData: unknown): boolean => {
  const contentType = (siblingData as { contentType?: ContentType } | undefined)?.contentType
  return !contentType || contentType === 'richText'
}

const isMode =
  (mode: ContentType) =>
  (_data: unknown, siblingData: unknown): boolean =>
    (siblingData as { contentType?: ContentType } | undefined)?.contentType === mode

/** 内容类型切换开关。 */
export const contentTypeField = ({ richTextLabel }: ContentTypeArgs): Field => ({
  name: 'contentType',
  type: 'select',
  label: '内容类型',
  defaultValue: 'richText',
  required: true,
  options: [
    { label: richTextLabel, value: 'richText' },
    { label: '纯 Markdown', value: 'markdown' },
    { label: 'HTML', value: 'html' },
  ],
  admin: {
    description: '选择正文编辑方式，切换后仅当前类型的内容会展示在前台。',
  },
})

/** 纯 Markdown 输入框：直接粘贴 Markdown 文本，前台渲染为 HTML。 */
export const markdownContentField: Field = {
  name: 'markdownContent',
  type: 'code',
  label: 'Markdown 内容',
  admin: {
    language: 'markdown',
    condition: isMode('markdown'),
    description: '直接粘贴 Markdown 文本即可，前台会自动渲染为 HTML。',
  },
}

/** HTML 输入相关字段：显示方式 + 上传按钮 + 源码框，前台用 iframe 渲染完整文档。 */
export const htmlContentFields: Field[] = [
  {
    name: 'htmlDisplayMode',
    type: 'select',
    label: 'HTML 显示方式',
    defaultValue: 'embed',
    options: [
      { label: '页面内嵌套显示（保留站点导航/页脚）', value: 'embed' },
      { label: '整页完全覆盖显示（隐藏站点框架）', value: 'fullscreen' },
    ],
    admin: {
      condition: isMode('html'),
      description: '嵌套：HTML 作为正文嵌入当前页面；整页覆盖：HTML 铺满整个浏览器视口。',
    },
  },
  {
    name: 'htmlUpload',
    type: 'ui',
    admin: {
      condition: isMode('html'),
      components: {
        Field: '@/fields/contentMode/HtmlUploadButton#HtmlUploadButton',
      },
    },
  },
  {
    name: 'htmlContent',
    type: 'code',
    label: 'HTML 内容',
    admin: {
      language: 'html',
      condition: isMode('html'),
      description:
        '可直接粘贴完整 HTML（含 <style>/<script>），或用上方按钮上传 .html 文件。前台以 iframe 隔离渲染，CSS 与 JS 均按原样生效。',
    },
  },
]

/** 一次性拿到「Markdown + HTML」两种模式所需的全部字段。 */
export const contentModeExtraFields: Field[] = [markdownContentField, ...htmlContentFields]
