'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from '../page.module.css'
import { SelectedImage } from './types'
import ImageModal from './components/ImageModal'
import AdvancedSearchModal from './components/AdvancedSearchModal'
import ImageSearchResults from './components/ImageSearchResults'
import VideoSearchResults from './components/VideoSearchResults'
import NormalSearchResults from './components/NormalSearchResults'
import SearchHeader from './components/SearchHeader'
import SearchTabs from './components/SearchTabs'
import EasterEggEffects from './components/EasterEggEffects'
import SnakeGame from './components/SnakeGame'
import { useRecaptcha } from '../hooks/useRecaptcha'
import { useEasterEggs } from './hooks/useEasterEggs'
import { useSearchData } from './hooks/useSearchData'
import { verifyRecaptcha } from './utils/recaptchaVerify'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const submittedQuery = searchParams.get('q') || ''
  const mediaFilter = searchParams.get('tbm') || ''
  const startParam = parseInt(searchParams.get('start') || '0')
  const resultsPerPage = 10
  
  const [searchQuery, setSearchQuery] = useState(submittedQuery)
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null)
  const [showToolsMenu, setShowToolsMenu] = useState(false)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [sortBy, setSortBy] = useState<'relevance' | 'latest' | 'oldest' | 'popular'>('relevance')
  const [isListening, setIsListening] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const { executeRecaptcha } = useRecaptcha()

  // 現在のページ番号（URLから計算）
  const currentPage = Math.floor(startParam / resultsPerPage) + 1

  // カスタムフック - ページ番号を渡す
  const easterEggs = useEasterEggs(submittedQuery)
  const { filteredTweets, isLoading, total, totalPages } = useSearchData({
    submittedQuery,
    mediaFilter,
    sortBy,
    executeRecaptcha,
    page: currentPage
  })

  // URLパラメータが変更されたら検索バーも更新
  useEffect(() => {
    setSearchQuery(submittedQuery)
  }, [submittedQuery])

  useEffect(() => {
    if (submittedQuery) {
      document.title = `${submittedQuery} - ヒカマーズ検索`
    } else {
      document.title = 'HikamersSearch'
    }
  }, [submittedQuery])

  const handlePageChange = (page: number) => {
    const start = (page - 1) * resultsPerPage
    const params = new URLSearchParams()
    params.set('q', submittedQuery)
    if (mediaFilter) {
      params.set('tbm', mediaFilter)
    }
    if (start > 0) {
      params.set('start', start.toString())
    }
    router.push(`/search?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams()
    params.set('q', submittedQuery)
    if (tab) {
      params.set('tbm', tab)
    }
    router.push(`/search?${params.toString()}`)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      router.push('/')
      return
    }

    const verified = await verifyRecaptcha(executeRecaptcha, 'search')
    if (!verified) {
      alert('ボットの可能性があると判定されました。しばらく待ってから再度お試しください。')
      return
    }

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

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event: any) => {
      setSearchQuery(event.results[0][0].transcript)
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
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  const handleSuggestionSelect = async (query: string) => {
    setSearchQuery(query)
    setIsFocused(false)
    
    const verified = await verifyRecaptcha(executeRecaptcha, 'search')
    if (!verified) {
      alert('ボットの可能性があると判定されました。しばらく待ってから再度お試しください。')
      return
    }
    
    try {
      await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      })
    } catch (error) {
      console.error('Failed to record search:', error)
    }
    
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className={`${styles.container} ${easterEggs.isBarrelRolling ? 'barrel-roll' : ''} ${easterEggs.isTilted ? 'tilted' : ''}`}>
      <SearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isListening={isListening}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
        showWordleLogo={easterEggs.showWordleLogo}
        showToolsMenu={showToolsMenu}
        setShowToolsMenu={setShowToolsMenu}
        sortBy={sortBy}
        setSortBy={setSortBy}
        setShowAdvancedSearch={setShowAdvancedSearch}
        onSearch={handleSearch}
        onVoiceInput={handleVoiceInput}
        onSuggestionSelect={handleSuggestionSelect}
      />

      <SearchTabs
        submittedQuery={submittedQuery}
        mediaFilter={mediaFilter}
        onTabChange={handleTabChange}
      />

      {isLoading && (
        <div className={styles.loading}>読み込み中...</div>
      )}

      <EasterEggEffects
        isLoading={isLoading}
        submittedQuery={submittedQuery}
        {...easterEggs}
      />

      {!isLoading && mediaFilter === 'isch' && (
        <ImageSearchResults
          tweets={filteredTweets}
          totalCount={total}
          onImageClick={setSelectedImage}
        />
      )}

      {!isLoading && mediaFilter === 'vid' && (
        <VideoSearchResults 
          tweets={filteredTweets}
          totalCount={total}
        />
      )}

      {!isLoading && !mediaFilter && (
        <>
          {easterEggs.showSnakeGame && <SnakeGame />}
          <NormalSearchResults
            tweets={filteredTweets}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            total={total}
            searchQuery={submittedQuery}
          />
        </>
      )}

      {showAdvancedSearch && (
        <AdvancedSearchModal onClose={() => setShowAdvancedSearch(false)} />
      )}

      {selectedImage && (
        <ImageModal selectedImage={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  )
}
