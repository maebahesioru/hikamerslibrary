import { memo, useState, useEffect, useRef, useCallback } from 'react'
import { Tweet, SelectedImage } from '../types'
import { extractMediaUrls, extractThumbnailUrls } from '../utils'
import styles from '../../page.module.css'
import imageStyles from './ImageSearchResults.module.css'

interface ImageSearchResultsProps {
  tweets: Tweet[]
  totalCount: number
  onImageClick: (image: SelectedImage) => void
}

interface ImageItem {
  tweet: Tweet
  url: string
  thumbnailUrl: string
  index: number
  height: number
}

function ImageSearchResults({ tweets, totalCount, onImageClick }: ImageSearchResultsProps) {
  const [columns, setColumns] = useState(5)
  const [imageItems, setImageItems] = useState<ImageItem[]>([])
  const [displayedCount, setDisplayedCount] = useState(50) // 初期表示数
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width <= 640) setColumns(2)
      else if (width <= 1024) setColumns(3)
      else if (width <= 1440) setColumns(4)
      else if (width <= 1920) setColumns(5)
      else setColumns(6)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const items: ImageItem[] = []
    console.log('[ImageSearchResults] Processing', tweets.length, 'tweets')
    tweets.forEach((tweet) => {
      const mediaUrls = extractMediaUrls(tweet.media)
      const thumbnailUrls = extractThumbnailUrls(tweet.media)
      if (mediaUrls.length === 0 && tweet.media && tweet.media !== 'なし') {
        console.log('[ImageSearchResults] Failed to extract from:', tweet.media?.substring(0, 100))
      }
      mediaUrls.forEach((url, index) => {
        items.push({
          tweet,
          url,
          thumbnailUrl: thumbnailUrls[index] || url,
          index,
          height: 200 + Math.random() * 150
        })
      })
    })
    console.log('[ImageSearchResults] Total image items:', items.length)
    setImageItems(items)
    setDisplayedCount(50) // リセット
  }, [tweets])

  // 無限スクロール
  const loadMore = useCallback(() => {
    if (isLoadingMore || displayedCount >= imageItems.length) return
    
    setIsLoadingMore(true)
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + 30, imageItems.length))
      setIsLoadingMore(false)
    }, 100)
  }, [isLoadingMore, displayedCount, imageItems.length])

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

  const distributeToColumns = () => {
    const cols: ImageItem[][] = Array.from({ length: columns }, () => [])
    const colHeights = Array(columns).fill(0)

    // 表示する分だけ配置
    const itemsToDisplay = imageItems.slice(0, displayedCount)
    itemsToDisplay.forEach((item) => {
      const shortestCol = colHeights.indexOf(Math.min(...colHeights))
      cols[shortestCol].push(item)
      colHeights[shortestCol] += item.height
    })

    return cols
  }

  const columnData = distributeToColumns()
  const hasMore = displayedCount < imageItems.length

  return (
    <div style={{ padding: '20px' }}>
      <div className={styles.resultStats}>
        約 {totalCount.toLocaleString()} 件の結果
      </div>

      <div className={imageStyles.masonryContainer}>
        {columnData.map((column, colIndex) => (
          <div key={colIndex} className={imageStyles.masonryColumn}>
            {column.map((item) => (
              <div
                key={`${item.tweet.id}-${item.index}`}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#202124',
                  marginBottom: '8px'
                }}
                onClick={() => onImageClick({ tweet: item.tweet, imageUrl: item.thumbnailUrl, index: item.index })}
              >
                <img
                  src={item.thumbnailUrl}
                  alt={item.tweet.displayText}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      parent.style.display = 'none'
                    }
                  }}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '8px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img
                      src={item.tweet.profileImage && item.tweet.profileImage.startsWith('http') ? item.tweet.profileImage : '/default-avatar.svg'}
                      alt={item.tweet.name}
                      onError={(e) => {
                        e.currentTarget.src = '/default-avatar.svg'
                        e.currentTarget.onerror = null
                      }}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {item.tweet.name}
                      {item.tweet.userVerified === 'true' && (
                        <svg viewBox="0 0 22 22" width="14" height="14" style={{ flexShrink: 0 }}>
                          <path fill="#1d9bf0" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                        </svg>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

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

      {!hasMore && imageItems.length > 0 && (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          すべての画像を表示しました（{imageItems.length}件）
        </div>
      )}

      {tweets.length === 0 && (
        <div className={styles.noResults}>
          <p>画像が見つかりませんでした。</p>
        </div>
      )}
    </div>
  )
}

export default memo(ImageSearchResults)
