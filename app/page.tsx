'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './page.module.css'
import ThemeToggle from './components/ThemeToggle'
import SearchSuggestions from './components/SearchSuggestions'

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      return
    }

    // 検索クエリを記録
    try {
      await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() })
      })
    } catch (error) {
      console.error('Failed to record search:', error)
    }

    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('お使いのブラウザは音声認識に対応していません。Chrome、Edge、Safariをお試しください。')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'ja-JP'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setSearchQuery(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      console.error('音声認識エラー:', event.error)
      setIsListening(false)
      if (event.error === 'no-speech') {
        alert('音声が検出されませんでした。もう一度お試しください。')
      } else if (event.error === 'not-allowed') {
        alert('マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  return (
    <main id="main-content" className={styles.container} role="main">
      <header className={styles.header}>
        <Image src="/logo.png" alt="HikamersSearch - ツイート検索エンジン" className={styles.logo} width={120} height={40} priority />
        <div className="home-theme-toggle" style={{ position: 'relative' }}>
          <ThemeToggle />
        </div>
      </header>
      <div className={styles.searchSection}>
        <Image src="/logo.png" alt="HikamersSearch" className={styles.logoLarge} width={400} height={135} priority style={{ width: 'auto', height: 'auto' }} />
        <form onSubmit={handleSearch} className={styles.searchForm} role="search" aria-label="ツイート検索">
          <div style={{ position: 'relative', width: '100%' }}>
            <div className={styles.searchBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                placeholder={isListening ? '音声入力中...' : 'ツイートを検索'}
                className={styles.searchInput}
                aria-label="検索キーワードを入力"
                autoComplete="off"
              />
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isListening ? '#4285f4' : 'var(--text-secondary)',
                    transition: 'color 0.2s',
                    flexShrink: 0
                  }}
                  title="音声入力"
                  aria-label="音声で検索"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/ai')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    color: '#fff',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)'
                  }}
                  title="AIモード"
                  aria-label="AI検索モードに切り替え"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                    <path d="M19 12l0.75 2.25L22 15l-2.25 0.75L19 18l-0.75-2.25L16 15l2.25-0.75L19 12z" />
                  </svg>
                  AIモード
                </button>
              </div>
            </div>
            <SearchSuggestions 
              isVisible={isFocused} 
              onSelect={async (query) => {
                setSearchQuery(query)
                setIsFocused(false)
                
                // 検索クエリを記録
                try {
                  await fetch('/api/suggestions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: query.trim() })
                  })
                } catch (error) {
                  console.error('Failed to record search:', error)
                }
                
                // 自動的に検索を実行
                router.push(`/search?q=${encodeURIComponent(query)}`)
              }}
              inputValue={searchQuery}
            />
          </div>
          <div className={styles.searchButtons}>
            <button type="submit" className={styles.searchActionButton}>
              ヒカマー検索
            </button>
            <button 
              type="button" 
              className={styles.searchActionButton}
              onClick={() => {
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery)}&lucky=1`)
                }
              }}
            >
              I&apos;m Feeling Lucky
            </button>
          </div>
        </form>
        
        {/* 内部リンクセクション - SEO強化 */}
        <nav aria-label="サイト内リンク" style={{ marginTop: '60px', textAlign: 'center' }}>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '16px', 
            justifyContent: 'center',
            fontSize: '14px'
          }}>
            <li><a href="/ai" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>AI検索</a></li>
            <li><a href="/hikamer-dx" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>ヒカマー表DX</a></li>
            <li><a href="/hikamer-dx/chat" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>なりきりAIチャット</a></li>
            <li><a href="/hikamer-dx/battle" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>AI創作</a></li>
            <li><a href="/download" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>データダウンロード</a></li>
            <li><a href="/faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>FAQ</a></li>
            <li><a href="/how-to-use" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>使い方</a></li>
            <li><a href="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>運営者情報</a></li>
          </ul>
        </nav>
      </div>
    </main>
  )
}
