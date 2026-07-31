import { createServerFeature } from '@payloadcms/richtext-lexical'

export type MarkdownPasteFeatureProps = {
  /**
   * 代码块使用的 block slug（需在同一编辑器的 BlocksFeature 中启用）。
   * 不传时，粘贴的代码围栏会退化为保留换行的纯文本段落。
   */
  codeBlockSlug?: string
  /** 代码块 language 字段允许的取值，围栏语言不在其中时回退为第一项。 */
  codeLanguages?: string[]
}

/** 粘贴 Markdown 文本时自动还原为富文本结构（标题/列表/表格/代码块等）。 */
export const MarkdownPasteFeature = createServerFeature<
  MarkdownPasteFeatureProps,
  MarkdownPasteFeatureProps,
  MarkdownPasteFeatureProps
>({
  feature: ({ props }) => ({
    ClientFeature: '@/fields/markdownPaste/feature.client#MarkdownPasteFeatureClient',
    clientFeatureProps: {
      codeBlockSlug: props?.codeBlockSlug,
      codeLanguages: props?.codeLanguages,
    },
    sanitizedServerFeatureProps: props,
  }),
  key: 'markdownPaste',
})
