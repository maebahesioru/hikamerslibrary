'use client'

import { FileInfo, ExportFormat } from '../types'
import { formatFileSize, handleDownload, handleDownloadAll } from '../hooks/useDownloadData'

interface YearSectionProps {
  year: string
  files: FileInfo[]
  isExpanded: boolean
  onToggle: () => void
  selectedFormat: ExportFormat
}

export function YearSection({ year, files, isExpanded, onToggle, selectedFormat }: YearSectionProps) {
  const totalCount = files.reduce((sum, f) => sum + f.count, 0)
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', background: 'var(--bg-secondary)',
          borderRadius: isExpanded ? '12px 12px 0 0' : '12px',
          border: '1px solid var(--border-color)',
          borderBottom: isExpanded ? 'none' : '1px solid var(--border-color)',
          cursor: 'pointer'
        }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--text-secondary)' }}>
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{year}年</h2>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            ({files.length}ファイル / {totalCount.toLocaleString()}件 / {formatFileSize(totalSize)})
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleDownloadAll(files, selectedFormat) }}
          style={{
            background: '#1a73e8', border: 'none', borderRadius: '8px', padding: '8px 16px',
            color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
          一括DL ({selectedFormat.toUpperCase()})
        </button>
      </div>

      {isExpanded && (
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: '0 0 12px 12px',
          border: '1px solid var(--border-color)', borderTop: 'none', overflow: 'hidden'
        }}>
          {files.map((file, index) => (
            <div
              key={file.date}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 20px',
                borderBottom: index < files.length - 1 ? '1px solid var(--border-color)' : 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{file.date}.{selectedFormat}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {file.count.toLocaleString()}件 / {formatFileSize(file.size)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDownload(file.date, selectedFormat)}
                style={{
                  background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px',
                  padding: '6px 12px', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                </svg>
                DL
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
