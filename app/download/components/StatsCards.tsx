'use client'

import { Stats } from '../types'
import { formatFileSize } from '../hooks/useDownloadData'

interface StatsCardsProps {
  stats: Stats
}

const cardStyle = {
  background: 'var(--bg-secondary)',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid var(--border-color)'
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
      <div style={cardStyle}>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>総ファイル数</div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.totalFiles.toLocaleString()}</div>
      </div>
      <div style={cardStyle}>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>総ツイート数</div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.totalTweets.toLocaleString()}</div>
      </div>
      <div style={cardStyle}>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>総データサイズ</div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatFileSize(stats.totalSize)}</div>
      </div>
      <div style={cardStyle}>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>対象期間</div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.years}年分</div>
      </div>
    </div>
  )
}
