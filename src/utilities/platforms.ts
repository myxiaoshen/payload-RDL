export const platformLabels: Record<string, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS',
  web: 'Web',
}

export const platformLabel = (value?: string | null) =>
  (value && platformLabels[value]) || value || ''
