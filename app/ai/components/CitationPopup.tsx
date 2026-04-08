'use client'

interface CitationPopupProps {
  tweets: any[]
  position: { x: number; y: number }
  onClose: () => void
}

export function CitationPopup({ tweets, position, onClose }: CitationPopupProps) {
  if (tweets.length === 0) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: position.y + 10,
        left: Math.min(position.x, window.innerWidth - 320),
        zIndex: 1000,
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '12px',
        maxWidth: '300px',
        maxHeight: '400px',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        {tweets.map((tweet, idx) => (
          <div key={idx} style={{ marginBottom: idx < tweets.length - 1 ? '12px' : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <img 
                src={tweet.profileImage || '/default-avatar.svg'} 
                alt="" 
                style={{ width: 24, height: 24, borderRadius: '50%' }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.svg' }}
              />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {tweet.name || tweet.userName || tweet.userId}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  @{tweet.userId}
                </div>
              </div>
            </div>
            <p style={{ 
              fontSize: '13px', 
              color: 'var(--text-primary)', 
              lineHeight: 1.5,
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {tweet.displayText?.slice(0, 150)}{tweet.displayText?.length > 150 ? '...' : ''}
            </p>
            <a 
              href={`https://x.com/${tweet.userId}/status/${tweet.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '11px', color: '#8ab4f8', textDecoration: 'none' }}
            >
              ツイートを見る →
            </a>
          </div>
        ))}
    </div>
  )
}
