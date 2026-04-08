import { useState, useEffect } from 'react'
import styles from '../quiz.module.css'
import type { Quarter } from '../types'

interface UserResult {
  userId: string
  userName: string
  tweetCount: number
}

interface Props {
  quarters: Quarter[]
  onStart: (params: { category: string; count: number; startDate: string; endDate: string; userId?: string }) => void
  loading: boolean
  error: string | null
}

export function QuizSetup({ quarters, onStart, loading, error }: Props) {
  const [category, setCategory] = useState('all')
  const [questionCount, setQuestionCount] = useState(5)
  const [era, setEra] = useState('all')
  const [dateMode, setDateMode] = useState<'preset' | 'custom'>('preset')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [userResults, setUserResults] = useState<UserResult[]>([])
  const [selectedUser, setSelectedUser] = useState<{ userId: string; userName: string } | null>(null)
  const [searchingUser, setSearchingUser] = useState(false)

  useEffect(() => {
    if (category !== 'people' || !userSearch.trim()) {
      setUserResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearchingUser(true)
      try {
        const res = await fetch(`/api/hikamer-dx/quiz?searchUser=${encodeURIComponent(userSearch)}`)
        const data = await res.json()
        setUserResults(data.users || [])
      } catch {
        setUserResults([])
      } finally {
        setSearchingUser(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [userSearch, category])

  const handleStart = () => {
    const quarter = quarters.find(q => q.value === era)
    onStart({
      category,
      count: questionCount,
      startDate: dateMode === 'custom' ? startDate : (quarter?.start || ''),
      endDate: dateMode === 'custom' ? endDate : (quarter?.end || ''),
      userId: selectedUser?.userId
    })
  }

  return (
    <div className={styles.setup}>
      <div className={styles.setupSection}>
        <label>期間</label>
        <div className={styles.dateModeToggle}>
          <button className={`${styles.modeBtn} ${dateMode === 'preset' ? styles.active : ''}`} onClick={() => setDateMode('preset')}>
            四半期から選択
          </button>
          <button className={`${styles.modeBtn} ${dateMode === 'custom' ? styles.active : ''}`} onClick={() => setDateMode('custom')}>
            日付を指定
          </button>
        </div>
        
        {dateMode === 'preset' ? (
          <div className={styles.eraGroup}>
            {quarters.map(q => (
              <button key={q.value} className={`${styles.eraBtn} ${era === q.value ? styles.active : ''}`} onClick={() => setEra(q.value)}>
                <span className={styles.eraLabel}>{q.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.dateInputs}>
            <div className={styles.dateField}>
              <label htmlFor="quiz-start-date">開始日</label>
              <input type="date" id="quiz-start-date" title="開始日を選択" value={startDate} onChange={e => setStartDate(e.target.value)} min="2019-01-01" className={styles.dateInput} />
            </div>
            <div className={styles.dateField}>
              <label htmlFor="quiz-end-date">終了日</label>
              <input type="date" id="quiz-end-date" title="終了日を選択" value={endDate} onChange={e => setEndDate(e.target.value)} min="2019-01-01" className={styles.dateInput} />
            </div>
          </div>
        )}
      </div>

      <div className={styles.setupSection}>
        <label>カテゴリ</label>
        <div className={styles.buttonGroup}>
          {[{ value: 'all', label: '🎯 全般' }, { value: 'people', label: '👥 人物' }].map(c => (
            <button key={c.value} className={`${styles.categoryBtn} ${category === c.value ? styles.active : ''}`}
              onClick={() => { setCategory(c.value); if (c.value !== 'people') { setSelectedUser(null); setUserSearch(''); setUserResults([]) } }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {category === 'people' && (
        <div className={styles.setupSection}>
          <label>人物を検索</label>
          <div className={styles.userSearchContainer}>
            <input type="text" className={styles.userSearchInput} placeholder="ハンドルネームまたは名前で検索..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            {searchingUser && <span className={styles.searchingText}>検索中...</span>}
          </div>
          {userResults.length > 0 && (
            <div className={styles.userResults}>
              {userResults.map(u => (
                <button key={u.userId} className={`${styles.userResultItem} ${selectedUser?.userId === u.userId ? styles.selected : ''}`}
                  onClick={() => { setSelectedUser({ userId: u.userId, userName: u.userName }); setUserResults([]); setUserSearch('') }}>
                  <span className={styles.userName}>{u.userName}</span>
                  <span className={styles.userHandle}>@{u.userId}</span>
                  <span className={styles.tweetCount}>{u.tweetCount}件</span>
                </button>
              ))}
            </div>
          )}
          {selectedUser && (
            <div className={styles.selectedUser}>
              選択中: <strong>{selectedUser.userName}</strong> (@{selectedUser.userId})
              <button type="button" className={styles.clearUser} onClick={() => setSelectedUser(null)}>×</button>
            </div>
          )}
        </div>
      )}

      <div className={styles.setupSection}>
        <label>問題数</label>
        <div className={styles.buttonGroup}>
          {[5, 10, 20, 50].map(n => (
            <button type="button" key={n} className={`${styles.countBtn} ${questionCount === n ? styles.active : ''}`} onClick={() => setQuestionCount(n)}>
              {n}問
            </button>
          ))}
          <input
            type="number"
            min={1}
            max={100}
            value={questionCount}
            onChange={(e) => setQuestionCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 5)))}
            className={styles.countInput}
            title="問題数（1〜100）"
          />
        </div>
      </div>

      <button type="button" className={styles.startBtn} onClick={handleStart} disabled={loading}>
        🚀 クイズを始める
      </button>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}
