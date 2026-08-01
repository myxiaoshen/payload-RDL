/** seed 数据用的 Lexical 富文本构造工具 */

type TextNode = {
  type: 'text'
  detail: number
  format: number
  mode: 'normal'
  style: string
  text: string
  version: 1
}

const textNode = (text: string, format = 0): TextNode => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

/** 标题节点，tag 取 h1~h4 */
export const h = (tag: 'h1' | 'h2' | 'h3' | 'h4', text: string) => ({
  type: 'heading',
  tag,
  children: [textNode(text)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
})

/** 段落节点 */
export const p = (text: string) => ({
  type: 'paragraph',
  children: [textNode(text)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
  version: 1,
})

/** 无序列表节点 */
export const ul = (items: string[]) => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  children: items.map((text, index) => ({
    type: 'listitem',
    value: index + 1,
    checked: false,
    children: [textNode(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  })),
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
})

/** Lexical 序列化节点的最小结构 */
type SerializedNode = { [k: string]: unknown; type: string; version: number }

/** 把若干节点包成一份完整的 Lexical 文档 */
export const richText = (children: SerializedNode[]) => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})
