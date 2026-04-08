'use client'

import { useRouter } from 'next/navigation'
import styles from '../page.module.css'
import ThemeToggle from '../components/ThemeToggle'
import { useDownloadData } from './hooks/useDownloadData'
import { SearchBar } from './components/SearchBar'
import { StatsCards } from './components/StatsCards'
import { YearSection } from './components/YearSection'
import { FormatSelector } from './components/FormatSelector'

export default function DownloadPage() {
  const router = useRouter()
  const {
    isLoading, filteredGroupedFiles, searchQuery, setSearchQuery,
    stats, expandedYears, toggleYear, expandAll, collapseAll,
    selectedFormat, setSelectedFormat
  } = useDownloadData()

  const resultCount = Object.values(filteredGroupedFiles).flat().length

  return (
    <div className={styles.container}>
      <div className={styles.headerWithSearch}>
        <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          HikamersSearch
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ThemeToggle />
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
          データセットダウンロード
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
          ヒカマー界隈のツイートデータを様々な形式でダウンロードできます。
          各ファイルには、ツイートID、投稿日時、ユーザー情報、エンゲージメント数などが含まれています。
        </p>

        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} resultCount={resultCount} />

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>読み込み中...</div>
        ) : (
          <>
            <StatsCards stats={stats} />
            
            <FormatSelector selectedFormat={selectedFormat} setSelectedFormat={setSelectedFormat} />

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button type="button" onClick={expandAll} style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px',
                padding: '10px 16px', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z"/>
                </svg>
                すべて展開
              </button>
              <button type="button" onClick={collapseAll} style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px',
                padding: '10px 16px', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z"/>
                </svg>
                すべて折りたたむ
              </button>
            </div>

            {Object.keys(filteredGroupedFiles).sort((a, b) => b.localeCompare(a)).map(year => (
              <YearSection
                key={year}
                year={year}
                files={filteredGroupedFiles[year]}
                isExpanded={expandedYears.has(year)}
                onToggle={() => toggleYear(year)}
                selectedFormat={selectedFormat}
              />
            ))}
          </>
        )}

        <div style={{
          background: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px',
          border: '1px solid var(--border-color)', marginTop: '32px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
            ご利用にあたって
          </h3>
          <ul style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>データは個人利用・研究目的でご利用ください</li>
            <li>全形式UTF-8エンコーディング対応</li>
            <li>TSV: タブ区切り / CSV: カンマ区切り / JSON: 配列形式 / JSONL: 1行1オブジェクト / XML: XML形式 / SQL: INSERT文</li>
            <li>一括ダウンロードは500ms間隔で順次ダウンロードされます</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
