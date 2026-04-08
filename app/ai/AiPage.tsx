'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from '../page.module.css'
import ThemeToggle from '../components/ThemeToggle'
import WelcomeScreen from './components/WelcomeScreen'
import AiResponse from './components/AiResponse'
import ReferencedTweets from './components/ReferencedTweets'
import AiStyles from './components/AiStyles'
import { useRecaptcha } from '../hooks/useRecaptcha'
import { useVoiceInput } from './hooks/useVoiceInput'
import { useAiSearch } from './hooks/useAiSearch'

export default function AiPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [headerQuery, setHeaderQuery] = useState('')
  const [followUpQuery, setFollowUpQuery] = useState('')
  const [showAllTweets, setShowAllTweets] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedPreviews, setUploadedPreviews] = useState<string[]>([])
  const [mediaFilesBase64, setMediaFilesBase64] = useState<{ data: string; mimeType: string }[]>([])
  
  const { executeRecaptcha } = useRecaptcha()
  const { isListening, startVoiceInput } = useVoiceInput()

  const submittedQuery = searchParams.get('q') || ''
  const shareId = searchParams.get('share') || ''

  // 再読み込み検出
  useEffect(() => {
    if (submittedQuery && !shareId) {
      const wasNavigating = sessionStorage.getItem('ai-navigating') === 'true'
      sessionStorage.removeItem('ai-navigating')
      
      if (!wasNavigating) {
        // 内部遷移ではない（再読み込みまたは直接アクセス）
        router.replace('/ai')
      }
    }
  }, [submittedQuery, shareId, router])

  // 内部遷移用のナビゲーション関数
  const navigateToAi = (query: string, isFollowUp = false) => {
    sessionStorage.setItem('ai-navigating', 'true')
    if (isFollowUp) {
      sessionStorage.setItem('ai-follow-up', 'true')
    }
    router.push(`/ai?q=${encodeURIComponent(query)}`)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    // 最大5ファイルまで
    const newFiles = [...uploadedFiles, ...files].slice(0, 5)
    setUploadedFiles(newFiles)
    
    // プレビュー生成
    const previews: string[] = []
    newFiles.forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        previews.push(URL.createObjectURL(file))
      } else if (file.type.startsWith('audio/')) {
        previews.push('audio')
      } else {
        previews.push('file')
      }
    })
    setUploadedPreviews(previews)
    
    // Base64変換
    const base64Files = await Promise.all(
      newFiles.map(file => new Promise<{ data: string; mimeType: string }>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1]
          resolve({ data: base64, mimeType: file.type })
        }
        reader.readAsDataURL(file)
      }))
    )
    setMediaFilesBase64(base64Files)
  }

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    const newPreviews = uploadedPreviews.filter((_, i) => i !== index)
    const newBase64 = mediaFilesBase64.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    setUploadedPreviews(newPreviews)
    setMediaFilesBase64(newBase64)
  }

  const {
    aiResponse,
    aiThinking,
    isLoading,
    loadingStep,
    extractedKeywords,
    conversationHistory,
    referencedTweets,
    searchQueries,
    relatedQuestions,
    tokenUsage,
    contextStats,
    clearHistory
  } = useAiSearch({ submittedQuery, shareId, executeRecaptcha, mediaFiles: mediaFilesBase64 })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = headerQuery || submittedQuery
    if (!query.trim()) {
      router.push('/')
      return
    }
    navigateToAi(query)
  }

  const handleBackToSearch = () => {
    router.push(submittedQuery ? `/search?q=${encodeURIComponent(submittedQuery)}` : '/')
  }

  return (
    <div className={styles.container}>
      {/* ヘッダー */}
      <div className={styles.headerWithSearch}>
        <div className={styles.logo} onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="HikamersSearch" style={{ height: '40px', width: 'auto' }} />
        </div>
        <form onSubmit={handleSearch} className={styles.searchFormCompact}>
          <div className={styles.searchBoxCompact}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '4px' }}>
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={headerQuery || submittedQuery}
              onChange={(e) => setHeaderQuery(e.target.value)}
              className={styles.searchInputCompact}
              placeholder={isListening ? '音声入力中...' : ''}
            />
            <button
              type="button"
              onClick={() => startVoiceInput(setHeaderQuery)}
              title="音声入力"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isListening ? '#4285f4' : 'var(--text-secondary)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>
          </div>
        </form>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {conversationHistory.length > 0 && (
            <button
              onClick={clearHistory}
              title="会話履歴をクリア"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '8px 12px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
              履歴クリア
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* タブ */}
      <div className={styles.tabs}>
        <div className={styles.tab} onClick={handleBackToSearch} style={{ cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          すべて
        </div>
        <div className={`${styles.tab} ${styles.tabActive}`}>AIモード</div>
        <div className={styles.tab} onClick={() => router.push(submittedQuery ? `/search?q=${encodeURIComponent(submittedQuery)}&tbm=isch` : '/search?tbm=isch')} style={{ cursor: 'pointer' }}>画像</div>
        <div className={styles.tab} onClick={() => router.push(submittedQuery ? `/search?q=${encodeURIComponent(submittedQuery)}&tbm=vid` : '/search?tbm=vid')} style={{ cursor: 'pointer' }}>動画</div>
      </div>

      {/* メインコンテンツ */}
      <div style={{ display: 'flex', margin: '0 auto', padding: '20px', gap: '24px', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '800px' }}>
          {!submittedQuery && (
            <WelcomeScreen
              searchQuery={searchQuery}
              isListening={isListening}
              onSearchQueryChange={setSearchQuery}
              onVoiceInput={() => startVoiceInput(setSearchQuery)}
              onNavigate={navigateToAi}
            />
          )}

          {submittedQuery && (
            <>
              <AiResponse
                submittedQuery={submittedQuery || searchQuery}
                isLoading={isLoading}
                loadingStep={loadingStep}
                extractedKeywords={extractedKeywords}
                aiResponse={aiResponse}
                aiThinking={aiThinking}
                tokenUsage={tokenUsage}
                contextStats={contextStats}
                referencedTweets={referencedTweets}
                searchQueries={searchQueries}
                conversationHistory={conversationHistory}
                executeRecaptcha={executeRecaptcha}
              />

              {!isLoading && aiResponse && (
                <>
                  {/* 関連質問の提案 */}
                  {relatedQuestions.length > 0 && (
                    <div style={{
                      marginTop: '24px',
                      padding: '16px 0',
                      borderTop: '1px solid var(--border-color)'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        関連
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {relatedQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => navigateToAi(question, true)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 0',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              textAlign: 'left',
                              color: 'var(--text-primary)',
                              fontSize: '14px',
                              transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'var(--text-secondary)' }}>
                              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{question}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <form onSubmit={(e) => {
                  e.preventDefault()
                  if (followUpQuery.trim() || uploadedFiles.length > 0) {
                    navigateToAi(followUpQuery || '添付ファイルについて教えて', true)
                    setFollowUpQuery('')
                    setUploadedFiles([])
                    setUploadedPreviews([])
                    setMediaFilesBase64([])
                  }
                }} style={{
                  marginTop: '32px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '24px',
                  padding: '16px 24px'
                }}>
                  {/* アップロードされたファイルのプレビュー */}
                  {uploadedFiles.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          {file.type.startsWith('image/') && (
                            <img src={uploadedPreviews[index]} alt={file.name} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                          )}
                          {file.type.startsWith('video/') && (
                            <video src={uploadedPreviews[index]} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                          )}
                          {file.type.startsWith('audio/') && (
                            <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--text-secondary)">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                              </svg>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: 'rgba(0,0,0,0.6)',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff'
                            }}
                            title="削除"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                          </button>
                          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'rgba(0,0,0,0.6)', padding: '2px 4px', fontSize: '9px', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept="image/*,video/*,audio/*"
                      onChange={handleFileUpload}
                      title="画像・動画・音声をアップロード"
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="file-upload"
                      title="画像・動画・音声をアップロード"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: uploadedFiles.length > 0 ? '#8ab4f8' : 'var(--text-secondary)'
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                    </label>
                    <input
                      type="text"
                      value={followUpQuery}
                      onChange={(e) => setFollowUpQuery(e.target.value)}
                      placeholder={uploadedFiles.length > 0 ? "ファイルについて質問..." : "質問する"}
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '15px' }}
                    />
                    <button type="button" onClick={() => startVoiceInput(setFollowUpQuery)} title="音声入力" aria-label="音声入力" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isListening ? '#8ab4f8' : 'var(--text-secondary)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                      </svg>
                    </button>
                    {(followUpQuery.trim() || uploadedFiles.length > 0) && (
                      <button type="submit" title="送信" style={{ background: '#8ab4f8', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#202124">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </form>
                </>
              )}
            </>
          )}
        </div>

        {(submittedQuery || searchQuery) && !isLoading && aiResponse && referencedTweets.length > 0 && (
          <ReferencedTweets
            tweets={referencedTweets}
            submittedQuery={submittedQuery || searchQuery}
            showAll={showAllTweets}
            onToggleShowAll={() => setShowAllTweets(!showAllTweets)}
            searchQueries={searchQueries}
          />
        )}
      </div>

      <AiStyles />
    </div>
  )
}
