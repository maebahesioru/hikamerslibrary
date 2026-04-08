'use client'

import { SortKey, ViewMode, sortCategories, sortLabels, viewModeLabels } from '../types'
import styles from '../hikamer-dx.module.css'

interface ControlsProps {
  sortBy: SortKey
  setSortBy: (v: SortKey) => void
  userFilter: string
  setUserFilter: (v: string) => void
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  onlyMania: boolean
  setOnlyMania: (v: boolean) => void
  useCustomDate: boolean
  setUseCustomDate: (v: boolean) => void
  dateFrom: string
  setDateFrom: (v: string) => void
  dateTo: string
  setDateTo: (v: string) => void
  year: string
  setYear: (v: string) => void
  limit: number
  setLimit: (v: number) => void
  availableYears: string[]
}

export function Controls({
  sortBy, setSortBy, userFilter, setUserFilter, viewMode, setViewMode,
  onlyMania, setOnlyMania, useCustomDate, setUseCustomDate,
  dateFrom, setDateFrom, dateTo, setDateTo, year, setYear, limit, setLimit, availableYears
}: ControlsProps) {
  return (
    <div className={styles.controls}>
      <div className={styles.controlsRow1}>
        <div className={styles.sortSection}>
          <label className={styles.sortLabel}>ランキング項目</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as SortKey)} 
            className={styles.sortSelect}
            title="ソート項目を選択"
          >
            {Object.entries(sortCategories).map(([category, keys]) => (
              <optgroup key={category} label={category}>
                {keys.map(key => (
                  <option key={key} value={key}>{sortLabels[key]}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className={styles.userSearch}>
          <input
            type="text"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            placeholder="🔍 ユーザー検索..."
            className={styles.userSearchInput}
          />
          {userFilter && (
            <button type="button" className={styles.clearBtn} onClick={() => setUserFilter('')}>✕</button>
          )}
        </div>
      </div>

      <div className={styles.controlsRow2}>
        <div className={styles.viewModeButtons}>
          {(Object.keys(viewModeLabels) as ViewMode[]).map((mode) => (
            <button 
              key={mode} 
              type="button" 
              className={`${styles.viewBtn} ${viewMode === mode ? styles.active : ''}`} 
              onClick={() => setViewMode(mode)}
            >
              {viewModeLabels[mode]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.controlsRow3}>
        <label className={styles.checkboxLabel} title="※正確に判別できるわけではありません">
          <input type="checkbox" checked={onlyMania} onChange={(e) => setOnlyMania(e.target.checked)} />
          ヒカマーのみ*
        </label>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" checked={useCustomDate} onChange={(e) => setUseCustomDate(e.target.checked)} />
          日付範囲
        </label>
        {useCustomDate ? (
          <div className={styles.dateRange}>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={styles.dateInput} title="開始日" />
            <span>〜</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={styles.dateInput} title="終了日" />
          </div>
        ) : (
          <select value={year} onChange={(e) => setYear(e.target.value)} className={styles.select} title="年を選択">
            <option value="all">全期間</option>
            {availableYears.map(y => <option key={y} value={y}>{y}年</option>)}
          </select>
        )}
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className={styles.select} title="表示人数">
          <option value={50}>50人</option>
          <option value={100}>100人</option>
          <option value={200}>200人</option>
          <option value={500}>500人</option>
          <option value={99999}>無制限</option>
        </select>
      </div>
    </div>
  )
}
