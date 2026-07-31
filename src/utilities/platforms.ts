export const platformLabels: Record<string, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS',
  web: 'Web',
}

// 各平台徽章配色（浅色/深色均有对比），未知平台回退到中性色。
export const platformBadgeClasses: Record<string, string> = {
  windows: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  macos: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-200',
  linux: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  android: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  ios: 'bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200',
  web: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
}

export const platformLabel = (value?: string | null) =>
  (value && platformLabels[value]) || value || ''

export const platformBadgeClass = (value?: string | null) =>
  (value && platformBadgeClasses[value]) || 'bg-muted text-muted-foreground'
