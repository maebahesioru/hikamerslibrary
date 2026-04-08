'use client'

import { useState } from 'react'

interface FeedbackFormProps {
  submittedQuery: string
  aiResponse: string
}

export default function FeedbackForm({ submittedQuery, aiResponse }: FeedbackFormProps) {
  const [rating, setRating] = useState<'good' | 'bad' | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRating = (newRating: 'good' | 'bad') => {
    setRating(newRating)
    setShowForm(true)
    setSelectedCategories([])
    setFeedbackText('')
  }

  const handleSubmit = async () => {
    if (!rating) return
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: submittedQuery,
          response: aiResponse,
          rating,
          feedback: feedbackText || null,
          categories: selectedCategories.length > 0 ? selectedCategories : null
        })
      })
      if (response.ok) setShowForm(false)
    } catch (error) {
      console.error('[Feedback] Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    )
  }

  const ratingButtonStyle = (isActive: boolean) => ({
    background: isActive ? '#1a73e8' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isActive ? '#fff' : 'var(--text-secondary)',
    transition: 'all 0.2s'
  })

  return (
    <>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => handleRating('good')} style={ratingButtonStyle(rating === 'good')} title="良い回答">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
          </svg>
        </button>
        <button onClick={() => handleRating('bad')} style={ratingButtonStyle(rating === 'bad')} title="悪い回答">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
          </svg>
        </button>
      </div>

      {showForm && (
        <>
        <div 
          onClick={() => setShowForm(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid var(--border-color)',
          width: '90%',
          maxWidth: '500px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {rating === 'good' ? '気に入った点はどこですか？' : 'ご不満な点はどこですか？'}
            </h3>
            <button onClick={() => setShowForm(false)} title="閉じる" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {(rating === 'good' 
              ? ['時間を節約', '消去', '役に立った', '包括的', 'その他']
              : ['不正確', '不適切', '機能しない', '役に立たなかった', 'その他']
            ).map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                style={{
                  background: selectedCategories.includes(category) ? '#1a73e8' : 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  color: selectedCategories.includes(category) ? '#fff' : 'var(--text-primary)',
                  fontSize: '14px'
                }}
              >
                {category}
              </button>
            ))}
          </div>

          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="できるだけ詳しく記述してください..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              marginBottom: '12px'
            }}
          />

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            このチャットの内容がフィードバックに含まれます
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              width: '100%',
              background: '#1a73e8',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting ? '送信中...' : '送信'}
          </button>
        </div>
        </>
      )}
    </>
  )
}
