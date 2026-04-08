'use client'

import { useState, useEffect, useRef } from 'react'

interface Tweet {
  id: string
  displayText: string
  userName?: string
  userId?: string
}

interface LoadingSpinnerProps {
  step?: 'keywords' | 'tweets' | 'thinking' | 'generating'
  keywords?: string[]
  tweets?: Tweet[]
  tweetCount?: number
}

const STEPS = [
  { key: 'keywords', label: '検索ワード生成', icon: '🔍' },
  { key: 'tweets', label: 'ツイート取得', icon: '📥' },
  { key: 'thinking', label: '推論中', icon: '🤔' },
  { key: 'generating', label: '回答生成', icon: '✍️' },
]

export default function LoadingSpinner({ step = 'keywords', keywords = [], tweets = [], tweetCount = 0 }: LoadingSpinnerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [visibleTweets, setVisibleTweets] = useState<Tweet[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevTweetCountRef = useRef(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsedTime(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  // ツイートが増えたら新しいものを表示リストに追加
  useEffect(() => {
    if (tweets.length > prevTweetCountRef.current) {
      const newTweets = tweets.slice(prevTweetCountRef.current)
      // 最新5件だけ表示（古いものは消える）
      setVisibleTweets(prev => [...prev, ...newTweets].slice(-5))
      prevTweetCountRef.current = tweets.length
    }
  }, [tweets])

  // 自動スクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [visibleTweets])

  const currentStepIndex = STEPS.findIndex(s => s.key === step)

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '16px'
    }}>
      {/* ステップインジケーター */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', position: 'relative' }}>
        {/* 接続線 */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '32px',
          right: '32px',
          height: '2px',
          background: 'var(--border-color)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '32px',
          width: `${Math.max(0, (currentStepIndex / (STEPS.length - 1)) * 100)}%`,
          maxWidth: 'calc(100% - 64px)',
          height: '2px',
          background: '#8ab4f8',
          zIndex: 1,
          transition: 'width 0.3s ease'
        }} />
        
        {STEPS.map((s, i) => {
          const isActive = i === currentStepIndex
          const isCompleted = i < currentStepIndex
          
          return (
            <div key={s.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isCompleted ? '#8ab4f8' : isActive ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                border: isActive ? '2px solid #8ab4f8' : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 0 12px rgba(138, 180, 248, 0.4)' : 'none'
              }}>
                {isCompleted ? '✓' : s.icon}
              </div>
              <span style={{
                marginTop: '6px',
                fontSize: '11px',
                color: isActive ? '#8ab4f8' : isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap'
              }}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* 現在のステップ詳細 */}
      <div style={{
        background: 'var(--bg-tertiary)',
        borderRadius: '12px',
        padding: '16px',
        minHeight: '60px'
      }}>
        {step === 'keywords' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: keywords.length > 0 ? '12px' : 0 }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '2px solid #8ab4f8',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <div>
                <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: 0 }}>
                  質問を解析中...
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '4px 0 0' }}>
                  検索キーワードを抽出しています
                </p>
              </div>
            </div>
            {/* キーワードがリアルタイムで追加される */}
            {keywords.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {keywords.map((k, i) => (
                  <span key={i} style={{
                    background: 'rgba(138, 180, 248, 0.2)',
                    color: '#8ab4f8',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    animation: 'fadeIn 0.3s ease-out'
                  }}>
                    {k}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'tweets' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid #8ab4f8',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: 0 }}>
                  ツイートを検索中...
                </p>
              </div>
              {(tweetCount > 0 || tweets.length > 0) && (
                <span style={{ 
                  color: '#8ab4f8', 
                  fontSize: '14px', 
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {(tweetCount || tweets.length).toLocaleString()}件
                </span>
              )}
            </div>
            {keywords.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {keywords.map((k, i) => (
                  <span key={i} style={{
                    background: 'rgba(138, 180, 248, 0.2)',
                    color: '#8ab4f8',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {k}
                  </span>
                ))}
              </div>
            )}
            {/* リアルタイムツイート表示 */}
            {visibleTweets.length > 0 && (
              <div 
                ref={scrollRef}
                style={{ 
                  maxHeight: '150px', 
                  overflowY: 'auto',
                  background: 'var(--bg-primary)',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              >
                {visibleTweets.map((tweet, i) => (
                  <div 
                    key={tweet.id || i} 
                    style={{
                      padding: '8px',
                      borderBottom: i < visibleTweets.length - 1 ? '1px solid var(--border-color)' : 'none',
                      animation: 'slideIn 0.3s ease-out',
                      opacity: 0.5 + (i / visibleTweets.length) * 0.5
                    }}
                  >
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--text-secondary)', 
                      marginBottom: '4px' 
                    }}>
                      @{tweet.userId || 'unknown'}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {tweet.displayText?.slice(0, 100)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'thinking' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>🤔</span>
              <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: 0 }}>
                AIが推論中...
              </p>
            </div>
            {tweetCount > 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
                {tweetCount.toLocaleString()}件のツイートを分析しています
              </p>
            )}
          </div>
        )}

        {step === 'generating' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px', animation: 'pulse 1s ease-in-out infinite' }}>✍️</span>
            <div>
              <p style={{ color: 'var(--text-primary)', fontSize: '14px', margin: 0 }}>
                回答を生成中...
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '4px 0 0' }}>
                まもなく表示されます
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 経過時間 */}
      <div style={{ 
        marginTop: '12px', 
        textAlign: 'right', 
        fontSize: '12px', 
        color: 'var(--text-secondary)' 
      }}>
        {elapsedTime}秒経過
      </div>

      {/* アニメーション用CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
