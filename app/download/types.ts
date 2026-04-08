export interface FileInfo {
  date: string
  count: number
  size: number
  year: string
}

export interface Stats {
  totalFiles: number
  totalTweets: number
  totalSize: number
  years: number
}

export type ExportFormat = 'tsv' | 'csv' | 'json' | 'jsonl' | 'xml' | 'sql' | 'yaml' | 'html' | 'md'

export const FORMAT_OPTIONS: { value: ExportFormat; label: string; desc: string }[] = [
  { value: 'tsv', label: 'TSV', desc: 'タブ区切り' },
  { value: 'csv', label: 'CSV', desc: 'カンマ区切り' },
  { value: 'json', label: 'JSON', desc: '配列形式' },
  { value: 'jsonl', label: 'JSONL', desc: '1行1オブジェクト' },
  { value: 'xml', label: 'XML', desc: 'XML形式' },
  { value: 'sql', label: 'SQL', desc: 'INSERT文' },
  { value: 'yaml', label: 'YAML', desc: '人間が読みやすい形式' },
  { value: 'html', label: 'HTML', desc: 'ブラウザで閲覧可能' },
  { value: 'md', label: 'Markdown', desc: 'テーブル形式' }
]
