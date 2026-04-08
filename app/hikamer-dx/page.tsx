'use client'

import { useState, useRef, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchHeader from '../search/components/SearchHeader'
import { SortKey, ViewMode } from './types'
import { useHikamerData } from './hooks/useHikamerData'
import { useImageDownload } from './hooks/useImageDownload'
import { Controls } from './components/Controls'
import { ScoreDetails, RankingDetails } from './components/ScoreDetails'
import { PodiumView, ListView, GridView } from './components/RankingViews'
import styles from './hikamer-dx.module.css'

function HikamerDXContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pyramidRef = useRef<HTMLDivElement>(null)
  
  // 状態
  const [sortBy, setSortBy] = useState<SortKey>((searchParams.get('sort') as SortKey) || 'total')
  const [year, setYear] = useState<string>(searchParams.get('year') || 'all')
  const [limit, setLimit] = useState(parseInt(searchParams.get('limit') || '100'))
  const [dateFrom, setDateFrom] = useState<string>(searchParams.get('from') || '')
  const [dateTo, setDateTo] = useState<string>(searchParams.get('to') || '')
  const [useCustomDate, setUseCustomDate] = useState(!!searchParams.get('from') || !!searchParams.get('to'))
  const [viewMode, setViewMode] = useState<ViewMode>((searchParams.get('view') as ViewMode) || 'podium')
  const [searchQuery, setSearchQuery] = useState('')
  const [userFilter, setUserFilter] = useState(searchParams.get('filter') || '')
  const [onlyMania, setOnlyMania] = useState(searchParams.get('mania') === '1')
  const [isFocused, setIsFocused] = useState(false)
  const [showToolsMenu, setShowToolsMenu] = useState(false)
  const [sortBySearch, setSortBySearch] = useState<'relevance' | 'latest' | 'oldest' | 'popular'>('relevance')

  // データ取得
  const { users: filteredUsers, loading, availableYears } = useHikamerData({
    sortBy, year, limit, dateFrom, dateTo, useCustomDate, userFilter, onlyMania
  })

  // 日付ラベル
  const getDateLabel = () => {
    if (useCustomDate) {
      if (dateFrom && dateTo) return `${dateFrom}〜${dateTo}`
      if (dateFrom) return `${dateFrom}〜`
      if (dateTo) return `〜${dateTo}`
      return '全期間'
    }
    return year === 'all' ? '全期間' : `${year}年`
  }

  // 画像ダウンロード
  const { downloadImage } = useImageDownload(pyramidRef, getDateLabel)

  // URLパラメータ更新
  useEffect(() => {
    const params = new URLSearchParams()
    if (sortBy !== 'total') params.set('sort', sortBy)
    if (year !== 'all') params.set('year', year)
    if (limit !== 100) params.set('limit', limit.toString())
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo)
    if (viewMode !== 'podium') params.set('view', viewMode)
    if (userFilter) params.set('filter', userFilter)
    if (onlyMania) params.set('mania', '1')
    const newUrl = params.toString() ? `/hikamer-dx?${params}` : '/hikamer-dx'
    window.history.replaceState(null, '', newUrl)
  }, [sortBy, year, limit, dateFrom, dateTo, viewMode, userFilter, onlyMania])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSuggestionSelect = (query: string) => {
    setSearchQuery(query)
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const viewProps = {
    users: filteredUsers,
    sortBy,
    dateLabel: getDateLabel(),
    userFilter,
    pyramidRef,
    onDownload: downloadImage
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchHeaderWrapper}>
        <SearchHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isListening={false}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
          showWordleLogo={false}
          showToolsMenu={showToolsMenu}
          setShowToolsMenu={setShowToolsMenu}
          sortBy={sortBySearch}
          setSortBy={setSortBySearch}
          setShowAdvancedSearch={() => {}}
          onSearch={handleSearch}
          onVoiceInput={() => {}}
          onSuggestionSelect={handleSuggestionSelect}
        />
      </div>

      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1>🏆 ヒカマー表DX</h1>
          <div className={styles.headerLinks}>
            <button type="button" onClick={() => router.push('/hikamer-dx/chat')} className={styles.headerLinkBtn}>💬 チャット</button>
            <button type="button" onClick={() => router.push('/hikamer-dx/group')} className={styles.headerLinkBtn}>👥 グループ</button>
            <button type="button" onClick={() => router.push('/hikamer-dx/battle')} className={styles.headerLinkBtn}>⚔️ バトル</button>
            <button type="button" onClick={() => router.push('/hikamer-dx/quiz')} className={styles.headerLinkBtn}>📝 クイズ</button>
          </div>
        </div>
        <p>その時期のヒカマニ界隈で活躍した主要ヒカマーたち</p>
        <p className={styles.note}>※「ヒカマーのみ」はID/名前/プロフに mania/マニア/マニ/まにあ/まに/キン/kin/tv/マー が含まれるかで判別、公式(ヒカキン/セイキン/マスオ/デカキン)は除外（正確ではありません）</p>
        <ScoreDetails />
        <RankingDetails />
      </header>

      <Controls
        sortBy={sortBy} setSortBy={setSortBy}
        userFilter={userFilter} setUserFilter={setUserFilter}
        viewMode={viewMode} setViewMode={setViewMode}
        onlyMania={onlyMania} setOnlyMania={setOnlyMania}
        useCustomDate={useCustomDate} setUseCustomDate={setUseCustomDate}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        year={year} setYear={setYear}
        limit={limit} setLimit={setLimit}
        availableYears={availableYears}
      />

      {loading ? (
        <div className={styles.loading}>読み込み中...</div>
      ) : viewMode === 'podium' ? (
        <PodiumView {...viewProps} />
      ) : viewMode === 'list' ? (
        <ListView {...viewProps} />
      ) : (
        <GridView {...viewProps} />
      )}
    </div>
  )
}

export default function HikamerDXPageWrapper() {
  return (
    <Suspense fallback={<div className={styles.loading}>読み込み中...</div>}>
      <HikamerDXContent />
    </Suspense>
  )
}
