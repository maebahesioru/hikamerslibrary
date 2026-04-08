'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Tweet } from '../types'

interface VirtualizedResultsProps {
  tweets: Tweet[]
  renderTweet: (tweet: Tweet, index: number) => React.ReactNode
}

const ITEMS_PER_PAGE = 50
const BUFFER_SIZE = 10 // 前後のバッファ

export default function VirtualizedResults({ tweets, renderTweet }: VirtualizedResultsProps) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: ITEMS_PER_PAGE })
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 無限スクロールの実装
  const loadMore = useCallback(() => {
    setVisibleRange(prev => ({
      start: prev.start,
      end: Math.min(prev.end + ITEMS_PER_PAGE, tweets.length)
    }))
  }, [tweets.length])

  useEffect(() => {
    if (!sentinelRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleRange.end < tweets.length) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    observerRef.current.observe(sentinelRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMore, visibleRange.end, tweets.length])

  // 表示するツイート
  const visibleTweets = tweets.slice(visibleRange.start, visibleRange.end)

  return (
    <div>
      {visibleTweets.map((tweet, index) => (
        <div key={tweet.id || index}>
          {renderTweet(tweet, visibleRange.start + index)}
        </div>
      ))}
      
      {visibleRange.end < tweets.length && (
        <div
          ref={sentinelRef}
          style={{
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}
        >
          読み込み中... ({visibleRange.end} / {tweets.length})
        </div>
      )}
      
      {visibleRange.end >= tweets.length && tweets.length > 0 && (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}
        >
          すべての結果を表示しました ({tweets.length}件)
        </div>
      )}
    </div>
  )
}
