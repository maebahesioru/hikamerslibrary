import { memo } from 'react'
import { Tweet } from '../types'
import { extractMediaUrls, extractThumbnailUrls, getTweetUrl } from '../utils'
import styles from '../../page.module.css'

interface TweetResultItemProps {
  tweet: Tweet
}

function TweetResultItem({ tweet }: TweetResultItemProps) {
  const tweetUrl = getTweetUrl(tweet.userId, tweet.id)
  
  return (
    <div className={styles.resultItem} data-tweet-id={tweet.id}>
      <div className="tweet-result-content" style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
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
            {tweet.userVerified === 'true' && <VerifiedBadge />}
            {tweet.userFollowersCount && parseInt(tweet.userFollowersCount) > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                ({parseInt(tweet.userFollowersCount).toLocaleString()} followers)
              </span>
            )}
          </a>
          <div className={styles.resultMeta}>
            <span>{tweet.createdAt}</span>
          </div>
          <div className={styles.resultText} style={{ whiteSpace: 'pre-wrap' }}>{tweet.displayText}</div>
          {tweet.hashtags && tweet.hashtags.trim() && (
            <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {tweet.hashtags.split(',').map((tag, i) => (
                <span key={i} style={{ 
                  fontSize: '12px', 
                  color: 'var(--link-color)', 
                  backgroundColor: 'var(--hover-bg)',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
        {tweet.media && tweet.media !== 'なし' && (
          <TweetMedia tweet={tweet} tweetUrl={tweetUrl} />
        )}
      </div>
      <TweetEngagement tweet={tweet} />
    </div>
  )
}

function VerifiedBadge() {
  return (
    <svg viewBox="0 0 22 22" width="16" height="16" style={{ flexShrink: 0 }}>
      <path fill="#1d9bf0" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
    </svg>
  )
}

function TweetMedia({ tweet, tweetUrl }: { tweet: Tweet; tweetUrl: string }) {
  return (
    <a
      href={tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="tweet-media"
      style={{
        width: '120px',
        height: '120px',
        flexShrink: 0,
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        display: 'block',
        textDecoration: 'none'
      }}
    >
      <img
        src={extractThumbnailUrls(tweet.media)[0] || extractMediaUrls(tweet.media)[0]}
        alt="Tweet media"
        onError={(e) => {
          const parent = e.currentTarget.parentElement
          if (parent) {
            parent.style.display = 'none'
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      {tweet.mediaType === 'video' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}
    </a>
  )
}

function TweetEngagement({ tweet }: { tweet: Tweet }) {
  return (
    <div className={styles.resultEngagement}>
      <span>💬 {tweet.replyCount}</span>
      <span>🔁 {tweet.rtCount}</span>
      <span>💭 {tweet.qtCount}</span>
      <span>❤️ {tweet.likesCount}</span>
      {tweet.viewCount && parseInt(tweet.viewCount) > 0 && (
        <span>👁 {parseInt(tweet.viewCount).toLocaleString()}</span>
      )}
      {tweet.bookmarkCount && parseInt(tweet.bookmarkCount) > 0 && (
        <span>🔖 {tweet.bookmarkCount}</span>
      )}
    </div>
  )
}

export default memo(TweetResultItem)
