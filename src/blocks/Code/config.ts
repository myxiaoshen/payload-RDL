import type { Block } from 'payload'

const languageOptions = [
  { label: '纯文本', value: 'plaintext' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TSX', value: 'tsx' },
  { label: 'JSX', value: 'jsx' },
  { label: 'HTML', value: 'markup' },
  { label: 'CSS', value: 'css' },
  { label: 'SCSS', value: 'scss' },
  { label: 'JSON', value: 'json' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Shell', value: 'bash' },
  { label: 'PowerShell', value: 'powershell' },
  { label: 'SQL', value: 'sql' },
  { label: 'Python', value: 'python' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'Java', value: 'java' },
  { label: 'C#', value: 'csharp' },
  { label: 'C/C++', value: 'cpp' },
  { label: 'PHP', value: 'php' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Dart', value: 'dart' },
  { label: 'Docker', value: 'docker' },
]

export const codeLanguages = languageOptions.map((option) => option.value)

export const Code: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  labels: {
    singular: '代码块',
    plural: '代码块',
  },
  fields: [
    {
      name: 'language',
      type: 'select',
      label: '语言',
      defaultValue: 'typescript',
      options: languageOptions,
    },
    {
      name: 'code',
      type: 'code',
      label: false,
      required: true,
    },
  ],
}
