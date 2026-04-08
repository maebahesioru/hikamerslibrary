'use client'

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: (v: string) => void
  resultCount: number
}

export function SearchBar({ searchQuery, setSearchQuery, resultCount }: SearchBarProps) {
  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px', marginBottom: '32px', border: '1px solid var(--border-color)' }}>
      <div style={{ position: 'relative' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ファイル名や日付で検索... (例: 2025-01-12)"
          style={{
            width: '100%', padding: '14px 16px 14px 48px', borderRadius: '8px',
            border: '1px solid var(--border-color)', background: 'var(--bg-primary)',
            color: 'var(--text-primary)', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#1a73e8'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="クリア"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        )}
      </div>
      {searchQuery && (
        <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {resultCount > 0 ? `${resultCount}件のファイルが見つかりました` : '該当するファイルが見つかりませんでした'}
        </div>
      )}
    </div>
  )
}
