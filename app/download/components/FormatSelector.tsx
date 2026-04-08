'use client'

import { ExportFormat, FORMAT_OPTIONS } from '../types'

interface FormatSelectorProps {
  selectedFormat: ExportFormat
  setSelectedFormat: (f: ExportFormat) => void
}

export function FormatSelector({ selectedFormat, setSelectedFormat }: FormatSelectorProps) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: '12px',
      padding: '16px 20px',
      marginBottom: '24px',
      border: '1px solid var(--border-color)'
    }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
        📁 ダウンロード形式
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {FORMAT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSelectedFormat(opt.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: selectedFormat === opt.value ? '2px solid #1a73e8' : '1px solid var(--border-color)',
              background: selectedFormat === opt.value ? 'rgba(26, 115, 232, 0.1)' : 'var(--bg-primary)',
              color: selectedFormat === opt.value ? '#1a73e8' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: selectedFormat === opt.value ? 600 : 400,
              transition: 'all 0.2s'
            }}
            title={opt.desc}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
        {FORMAT_OPTIONS.find(o => o.value === selectedFormat)?.desc}
      </div>
    </div>
  )
}
