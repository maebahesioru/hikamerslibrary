import { useRouter } from 'next/navigation'
import styles from '../../page.module.css'

interface SearchTabsProps {
  submittedQuery: string
  mediaFilter: string
  onTabChange: (tab: string) => void
}

export default function SearchTabs({ submittedQuery, mediaFilter, onTabChange }: SearchTabsProps) {
  const router = useRouter()

  return (
    <div className={styles.tabs}>
      <div
        className={`${styles.tab} ${!mediaFilter ? styles.tabActive : ''}`}
        onClick={() => onTabChange('')}
        style={{ cursor: 'pointer' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        すべて
      </div>
      <div
        className={styles.tab}
        onClick={() => router.push(`/ai?q=${encodeURIComponent(submittedQuery)}`)}
        style={{ cursor: 'pointer' }}
      >
        AIモード
      </div>
      <div
        className={`${styles.tab} ${mediaFilter === 'isch' ? styles.tabActive : ''}`}
        onClick={() => onTabChange('isch')}
        style={{ cursor: 'pointer' }}
      >
        画像
      </div>
      <div
        className={`${styles.tab} ${mediaFilter === 'vid' ? styles.tabActive : ''}`}
        onClick={() => onTabChange('vid')}
        style={{ cursor: 'pointer' }}
      >
        動画
      </div>
    </div>
  )
}
