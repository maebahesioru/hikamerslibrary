'use client'

import ShareMenu from './ShareMenu'
import FeedbackForm from './FeedbackForm'
import { TTSVoice } from '../../hooks/useTTS'

interface ResponseActionsProps {
  submittedQuery: string
  aiResponse: string
  referencedTweets?: any[]
  searchQueries?: string[]
  isSpeaking: boolean
  speak: (text: string) => void
  stop: () => void
  voices: TTSVoice[]
  selectedVoice: string
  setSelectedVoice: (v: string) => void
}

export function ResponseActions({
  submittedQuery, aiResponse, referencedTweets, searchQueries,
  isSpeaking, speak, stop, voices, selectedVoice, setSelectedVoice
}: ResponseActionsProps) {
  return (
    <div style={{ paddingLeft: '8px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={() => isSpeaking ? stop() : speak(aiResponse)}
            title={isSpeaking ? '停止' : '読み上げ'}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: isSpeaking ? '#8ab4f8' : 'var(--text-secondary)',
              fontSize: '13px'
            }}
          >
            {isSpeaking ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h12v12H6z"/>
                </svg>
                停止
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
                読み上げ
              </>
            )}
          </button>
          {voices.length > 0 && (
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              title="読み上げ音声を選択"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '6px 8px',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
                maxWidth: '150px'
              }}
            >
              {voices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name.replace(/Microsoft |Google /, '')}
                </option>
              ))}
            </select>
          )}
        </div>
        <ShareMenu 
          submittedQuery={submittedQuery} 
          aiResponse={aiResponse} 
          referencedTweets={referencedTweets} 
          searchQueries={searchQueries} 
        />
        <FeedbackForm submittedQuery={submittedQuery} aiResponse={aiResponse} />
      </div>
    </div>
  )
}
