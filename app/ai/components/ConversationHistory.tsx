'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ConversationEntry {
  query: string
  response: string
  thinking?: string
  tweets?: any[]
}

interface ConversationHistoryProps {
  history: ConversationEntry[]
}

export function ConversationHistory({ history }: ConversationHistoryProps) {
  if (history.length === 0) return null

  return (
    <>
      {history.map((entry, idx) => (
        <div key={idx} style={{ marginBottom: '32px', opacity: 0.85 }}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#8ab4f8', flexShrink: 0, marginTop: '2px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>AIモード</h2>
                <p style={{ fontSize: '16px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{entry.query}</p>
              </div>
            </div>
          </div>
          {entry.thinking && (
            <details style={{ marginBottom: '16px' }}>
              <summary style={{
                cursor: 'pointer',
                padding: '12px 16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '12px',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🤔 推論過程
              </summary>
              <div style={{
                padding: '16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '0 0 12px 12px',
                marginTop: '-8px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
              }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.thinking}</ReactMarkdown>
              </div>
            </details>
          )}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px' }}>
            <div className="markdown-content" style={{ color: 'var(--text-primary)', fontSize: '15px', lineHeight: '1.8' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.response}</ReactMarkdown>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
