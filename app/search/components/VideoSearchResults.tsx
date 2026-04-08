import { memo, useState, useEffect, useRef, useCallback } from 'react'
import { Tweet } from '../types'
import { extractMediaUrls, extractThumbnailUrls, getTweetUrl } from '../utils'
import styles from '../../page.module.css'

interface VideoSearchResultsProps {
  tweets: Tweet[]
  totalCount: number
}

function VideoSearchResults({ tweets, totalCount }: VideoSearchResultsProps) {
  const [displayedCount, setDisplayedCount] = useState(20) // 初期表示数
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDisplayedCount(20) // リセット
  }, [tweets])

  // 無限スクロール
  const loadMore = useCallback(() => {
    if (isLoadingMore || displayedCount >= tweets.length) return
    
    setIsLoadingMore(true)
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + 20, tweets.length))
      setIsLoadingMore(false)
    }, 100)
  }, [isLoadingMore, displayedCount, tweets.length])

  useEffect(() => {
    if (!loadMoreRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMore])

  const displayedTweets = tweets.slice(0, displayedCount)
  const hasMore = displayedCount < tweets.length

  return (
    <div className={styles.results}>
      <div className={styles.resultStats}>
        約 {totalCount.toLocaleString()} 件の結果
      </div>

      {displayedTweets.map((tweet) => {
        const mediaUrls = extractMediaUrls(tweet.media)
        const thumbnailUrls = extractThumbnailUrls(tweet.media)
        const tweetUrl = getTweetUrl(tweet.userId, tweet.id)
        return mediaUrls.map((url, index) => (
          <div
            key={`${tweet.id}-${index}`}
            className="video-result-item"
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '24px'
            }}
          >
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="video-thumbnail"
              style={{
                position: 'relative',
                width: '246px',
                height: '138px',
                flexShrink: 0,
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#202124',
                display: 'block',
                textDecoration: 'none'
              }}
            >
              <img
                src={thumbnailUrls[index]}
                alt={tweet.displayText}
                onError={(e) => {
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                    parent.style.backgroundColor = '#333'
                    parent.style.display = 'flex'
                    parent.style.alignItems = 'center'
                    parent.style.justifyContent = 'center'
                  }
                  e.currentTarget.style.display = 'none'
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </a>
            <div className="video-details" style={{ flex: 1, minWidth: 0 }}>
              <div className={styles.resultUrl}>
                <div className={styles.resultIcon}>
                  <img
                    src={tweet.profileImage && tweet.profileImage.startsWith('http') ? tweet.profileImage : '/default-avatar.svg'}
                    alt={tweet.name}
                    onError={(e) => {
                      e.currentTarget.src = '/default-avatar.svg'
                      e.currentTarget.onerror = null
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.resultDomain}>
                  <div className={styles.resultBreadcrumb}>
                    x.com › {tweet.userId}
                  </div>
                </div>
              </div>
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.resultTitle}
                style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {tweet.name} (@{tweet.userId})
                {tweet.userVerified === 'true' && (
                  <svg viewBox="0 0 22 22" width="16" height="16" style={{ flexShrink: 0 }}>
                    <path fill="#1d9bf0" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                  </svg>
                )}
              </a>
              <div className={styles.resultMeta}>
                <span>{tweet.createdAt}</span>
              </div>
              <div className={styles.resultText} style={{ whiteSpace: 'pre-wrap' }}>{tweet.displayText}</div>
              <div className={styles.resultEngagement} style={{ marginTop: '8px' }}>
                <span>💬 {tweet.replyCount}</span>
                <span>🔁 {tweet.rtCount}</span>
                <span>💭 {tweet.qtCount}</span>
                <span>❤️ {tweet.likesCount}</span>
                {tweet.viewCount && parseInt(tweet.viewCount) > 0 && (
                  <span>👁 {parseInt(tweet.viewCount).toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        ))
      })}

      {hasMore && (
        <div 
          ref={loadMoreRef}
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}
        >
          {isLoadingMore ? '読み込み中...' : ''}
        </div>
      )}

      {!hasMore && tweets.length > 0 && (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          すべての動画を表示しました（{tweets.length}件）
        </div>
      )}

      {tweets.length === 0 && (
        <div className={styles.noResults}>
          <p>動画が見つかりませんでした。</p>
        </div>
      )}
    </div>
  )
}

export default memo(VideoSearchResults)
