'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import LoadingSpinner from './LoadingSpinner'
import { CitationPopup } from './CitationPopup'
import { ConversationHistory } from './ConversationHistory'
import { ResponseActions } from './ResponseActions'
import { useTTS } from '../../hooks/useTTS'
import type { LoadingStep } from '../hooks/useAiSearch'

interface ConversationEntry {
  query: string
  response: string
  thinking?: string
  tweets?: any[]
}

interface AiResponseProps {
  submittedQuery: string
  isLoading: boolean
  loadingStep?: LoadingStep
  extractedKeywords?: string[]
  aiResponse: string
  aiThinking?: string
  tokenUsage?: { promptTokens: number; completionTokens: number; totalTokens: number } | null
  contextStats?: { chars: number; tweets: number } | null
  referencedTweets?: any[]
  searchQueries?: string[]
  conversationHistory?: ConversationEntry[]
  executeRecaptcha?: (action: string) => Promise<string | null>
}

export default function AiResponse({ 
  submittedQuery, isLoading, loadingStep = 'keywords', extractedKeywords = [],
  aiResponse, aiThinking, tokenUsage, contextStats,
  referencedTweets, searchQueries, conversationHistory = [], executeRecaptcha 
}: AiResponseProps) {
  const [popupData, setPopupData] = useState<{ tweets: any[]; position: { x: number; y: number } } | null>(null)
  const { isSpeaking, speak, stop, voices, selectedVoice, setSelectedVoice } = useTTS()
  const currentQueryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (submittedQuery && currentQueryRef.current) {
      setTimeout(() => {
        currentQueryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [submittedQuery])

  useEffect(() => {
    if (!popupData) return
    const handleScroll = () => setPopupData(null)
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [popupData])

  const handleCitationHover = useCallback((e: React.MouseEvent, indices: number[]) => {
    if (!referencedTweets) return
    const tweets = indices.map(i => referencedTweets[i - 1]).filter(Boolean)
    if (tweets.length > 0) {
      setPopupData({ tweets, position: { x: e.clientX, y: e.clientY } })
    }
  }, [referencedTweets])

  const handleCitationLeave = useCallback(() => setPopupData(null), [])

  const processTextWithCitations = useCallback((text: string) => {
    const parts = text.split(/(\[\d+(?:,\s*\d+)*\](?:\[\d+\])*)/g)
    return parts.map((part, idx) => {
      const match = part.match(/^\[(\d+(?:,\s*\d+)*)\](?:\[(\d+)\])*$/)
      if (match) {
        const allNumbers = part.match(/\d+/g)?.map(Number) || []
        return (
          <span
            key={idx}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = 'rgba(138, 180, 248, 0.2)'
              handleCitationHover(e, allNumbers)
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = 'transparent'
              handleCitationLeave()
            }}
            style={{
              color: '#8ab4f8', cursor: 'pointer', fontSize: '12px',
              verticalAlign: 'super', padding: '0 2px', borderRadius: '4px', transition: 'background 0.2s'
            }}
          >
            {part}
          </span>
        )
      }
      return part
    })
  }, [handleCitationHover, handleCitationLeave])

  const components = {
    p: ({ children }: any) => (
      <p style={{ marginBottom: '1em' }}>
        {typeof children === 'string' ? processTextWithCitations(children)
          : Array.isArray(children) ? children.map((child) => typeof child === 'string' ? processTextWithCitations(child) : child)
          : children}
      </p>
    ),
    li: ({ children }: any) => (
      <li>
        {typeof children === 'string' ? processTextWithCitations(children)
          : Array.isArray(children) ? children.map((child) => typeof child === 'string' ? processTextWithCitations(child) : child)
          : children}
      </li>
    )
  }

  const displayHistory = conversationHistory.filter(
    (entry, idx) => !(idx === conversationHistory.length - 1 && entry.query === submittedQuery)
  )

  return (
    <>
      <ConversationHistory history={displayHistory} />

      <div ref={currentQueryRef} style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#8ab4f8', flexShrink: 0, marginTop: '2px' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>AIモード</h2>
            <p style={{ fontSize: '16px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{submittedQuery}</p>
          </div>
        </div>
      </div>

      {isLoading && !aiResponse && (loadingStep === 'keywords' || loadingStep === 'tweets') && (
        <LoadingSpinner step={loadingStep} keywords={extractedKeywords} tweets={referencedTweets} tweetCount={referencedTweets?.length || 0} />
      )}

      {(aiResponse || loadingStep === 'thinking' || loadingStep === 'generating') && (
        <div>
          {aiThinking && (
            <details style={{ marginBottom: '16px' }} open={!aiResponse}>
              <summary style={{
                cursor: 'pointer', padding: '12px 16px', background: 'var(--bg-tertiary)',
                borderRadius: aiResponse ? '12px' : '12px 12px 0 0', fontSize: '14px',
                color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                {!aiResponse && (
                  <div style={{ width: '14px', height: '14px', border: '2px solid #8ab4f8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                )}
                🤔 推論過程
              </summary>
              <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '0 0 12px 12px', marginTop: '-8px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiThinking}</ReactMarkdown>
              </div>
            </details>
          )}

          <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
            {isLoading && !aiResponse && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '20px', height: '20px', border: '2px solid #8ab4f8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {loadingStep === 'thinking' ? '推論中...' : '回答を生成中...'}
                </span>
                {referencedTweets && referencedTweets.length > 0 && (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    ({referencedTweets.length.toLocaleString()}件のツイートを分析)
                  </span>
                )}
              </div>
            )}
            
            {aiResponse ? (
              <div className="markdown-content" style={{ color: 'var(--text-primary)', fontSize: '15px', lineHeight: '1.8' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{aiResponse}</ReactMarkdown>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>回答を準備しています...</div>
            )}
            
            {popupData && <CitationPopup tweets={popupData.tweets} position={popupData.position} onClose={() => setPopupData(null)} />}
            
            {(contextStats || tokenUsage) && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                {contextStats && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg>
                      <span>{contextStats.chars.toLocaleString()}文字</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                      <span>{contextStats.tweets.toLocaleString()}件</span>
                    </div>
                  </>
                )}
                {tokenUsage ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>入力: {tokenUsage.promptTokens.toLocaleString()}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>出力: {tokenUsage.completionTokens.toLocaleString()}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}><span>計: {tokenUsage.totalTokens.toLocaleString()}トークン</span></div>
                  </>
                ) : contextStats && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>≈{Math.round(contextStats.chars * 0.75).toLocaleString()}トークン</span></div>
                )}
              </div>
            )}
          </div>

          {aiResponse && !isLoading && (
            <ResponseActions
              submittedQuery={submittedQuery}
              aiResponse={aiResponse}
              referencedTweets={referencedTweets}
              searchQueries={searchQueries}
              isSpeaking={isSpeaking}
              speak={speak}
              stop={stop}
              voices={voices}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
            />
          )}
        </div>
      )}
    </>
  )
}
