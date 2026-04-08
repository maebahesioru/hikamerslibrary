'use client'

import { useState } from 'react'

interface ShareMenuProps {
  submittedQuery: string
  aiResponse: string
  referencedTweets?: any[]
  searchQueries?: string[]
}

export default function ShareMenu({ submittedQuery, aiResponse, referencedTweets, searchQueries }: ShareMenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleShare = async (platform: 'x' | 'bluesky' | 'copy') => {
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: submittedQuery, response: aiResponse, tweets: referencedTweets, searchQueries })
      })

      if (!response.ok) throw new Error('Failed to create share link')

      const { id } = await response.json()
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const shareUrl = `${baseUrl}/ai?share=${id}`
      
      switch (platform) {
        case 'x':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${submittedQuery}\n\n`)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=550,height=420')
          break
        case 'bluesky':
          window.open(`https://bsky.app/intent/compose?text=${encodeURIComponent(`${submittedQuery}\n\n${shareUrl}`)}`, '_blank', 'width=550,height=420')
          break
        case 'copy':
          await navigator.clipboard.writeText(shareUrl)
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
          break
      }
    } catch {
      alert('共有リンクの作成に失敗しました')
    }
    setShowMenu(false)
  }

  const menuButtonStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    textAlign: 'left' as const
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        title="共有"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
        </svg>
      </button>
      
      {showMenu && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          marginBottom: '8px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 100,
          minWidth: '180px'
        }}>
          <button onClick={() => handleShare('x')} style={menuButtonStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Xで共有
          </button>
          <button onClick={() => handleShare('bluesky')} style={menuButtonStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
            </svg>
            Blueskyで共有
          </button>
          <button onClick={() => handleShare('copy')} style={menuButtonStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
            {copySuccess ? 'コピーしました！' : 'リンクをコピー'}
          </button>
        </div>
      )}
    </div>
  )
}
