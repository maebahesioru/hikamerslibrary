import { useRouter } from 'next/navigation'
import styles from '../../page.module.css'
import ThemeToggle from '../../components/ThemeToggle'
import SearchSuggestions from '../../components/SearchSuggestions'
import WordleLogo from './WordleLogo'

interface SearchHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  isListening: boolean
  isFocused: boolean
  setIsFocused: (focused: boolean) => void
  showWordleLogo: boolean
  showToolsMenu: boolean
  setShowToolsMenu: (show: boolean) => void
  sortBy: 'relevance' | 'latest' | 'oldest' | 'popular'
  setSortBy: (sort: 'relevance' | 'latest' | 'oldest' | 'popular') => void
  setShowAdvancedSearch: (show: boolean) => void
  onSearch: (e: React.FormEvent) => void
  onVoiceInput: () => void
  onSuggestionSelect: (query: string) => void
}

export default function SearchHeader({
  searchQuery,
  setSearchQuery,
  isListening,
  isFocused,
  setIsFocused,
  showWordleLogo,
  showToolsMenu,
  setShowToolsMenu,
  sortBy,
  setSortBy,
  setShowAdvancedSearch,
  onSearch,
  onVoiceInput,
  onSuggestionSelect
}: SearchHeaderProps) {
  const router = useRouter()

  return (
    <div className={styles.headerWithSearch}>
      <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
        {showWordleLogo ? <WordleLogo /> : <img src="/logo.png" alt="HikamersSearch" style={{ height: '40px', width: 'auto' }} />}
      </div>
      <form onSubmit={onSearch} className={styles.searchFormCompact} style={{ position: 'relative' }}>
        <div className={styles.searchBoxCompact}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '4px' }}>
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className={styles.searchInputCompact}
            placeholder={isListening ? '音声入力中...' : ''}
          />
          <button
            type="button"
            onClick={onVoiceInput}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isListening ? '#4285f4' : 'var(--text-secondary)',
              transition: 'color 0.2s'
            }}
            title="音声入力"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
        </div>
        <SearchSuggestions 
          isVisible={isFocused} 
          onSelect={onSuggestionSelect}
          inputValue={searchQuery}
        />
      </form>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <ThemeToggle />
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowToolsMenu(!showToolsMenu)}
            className="tools-button"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px 16px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'background-color 0.2s, border-color 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
              e.currentTarget.style.borderColor = 'var(--text-secondary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = 'var(--border-color)'
            }}
          >
            ツール
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
          {showToolsMenu && (
            <div 
              className="tools-menu"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 0',
                minWidth: '200px',
                maxWidth: 'calc(100vw - 32px)',
                zIndex: 100,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                marginTop: '4px'
              }}
            >
              <div style={{ padding: '8px 16px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold' }}>
                並べ替え
              </div>
              {(['relevance', 'latest', 'oldest', 'popular'] as const).map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    setSortBy(option)
                    setShowToolsMenu(false)
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    color: sortBy === option ? 'var(--link-color)' : 'var(--text-primary)',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {sortBy === option && <span>✓</span>}
                  {option === 'relevance' && '関連性'}
                  {option === 'latest' && '最新'}
                  {option === 'oldest' && '古い順'}
                  {option === 'popular' && '人気順'}
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border-color)', margin: '8px 0' }}></div>
              <div
                onClick={() => {
                  setShowAdvancedSearch(true)
                  setShowToolsMenu(false)
                }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                検索オプション
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
