interface ReferencedTweetsProps {
  tweets: any[]
  submittedQuery: string
  showAll: boolean
  onToggleShowAll: () => void
  searchQueries?: string[]
}

export default function ReferencedTweets({ tweets, submittedQuery, showAll, onToggleShowAll, searchQueries }: ReferencedTweetsProps) {
  if (tweets.length === 0) return null

  const displayedTweets = showAll ? tweets : tweets.slice(0, 10)

  return (
    <div className="referenced-tweets" style={{ width: '360px', flexShrink: 0 }}>
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#8ab4f8' }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            参照したツイート
          </h3>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {searchQueries && searchQueries.length > 0 ? (
            <>
              以下の検索ワードで{tweets.length}件のツイートを参照：
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {searchQueries.map((query, index) => (
                  <span
                    key={index}
                    style={{
                      background: 'var(--bg-primary)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      border: '1px solid var(--border-color)',
                      color: '#8ab4f8'
                    }}
                  >
                    {query}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>「{submittedQuery}」で調べ、検索結果から{tweets.length}件のツイートを参照しています</>
          )}
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          {displayedTweets.map((tweet, index) => {
            const tweetUrl = `https://x.com/${tweet.userId}/status/${tweet.id}`
            return (
              <a
                key={index}
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--bg-primary)',
                  borderRadius: '8px',
                  padding: '12px',
                  textDecoration: 'none',
                  border: '1px solid var(--border-color)',
                  transition: 'border-color 0.2s, background-color 0.2s',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8ab4f8'
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)'
                  e.currentTarget.style.backgroundColor = 'var(--bg-primary)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {tweet.profileImage ? (
                    <img
                      src={tweet.profileImage}
                      alt={tweet.name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: 'var(--text-secondary)'
                    }}>
                      {tweet.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {tweet.name}
                      {tweet.userVerified === 'true' && (
                        <svg viewBox="0 0 22 22" width="14" height="14" style={{ flexShrink: 0 }}>
                          <path fill="#1d9bf0" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
                        </svg>
                      )}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      @{tweet.userId}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.5',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  marginBottom: '8px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {tweet.displayText}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span>💬 {tweet.replyCount || 0}</span>
                  <span>🔁 {tweet.rtCount || 0}</span>
                  <span>❤️ {tweet.likesCount || 0}</span>
                </div>
              </a>
            )
          })}
        </div>
        {tweets.length > 10 && (
          <button
            onClick={onToggleShowAll}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#8ab4f8',
              cursor: 'pointer',
              transition: 'background-color 0.2s, border-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
              e.currentTarget.style.borderColor = '#8ab4f8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = 'var(--border-color)'
            }}
          >
            {showAll ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                </svg>
                表示を減らす
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
                </svg>
                他 {tweets.length - 10} 件のツイートを表示
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
