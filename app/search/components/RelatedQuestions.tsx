import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RelatedQuestion {
  question: string
  answer?: string
  tweetId?: string
  tweetUserId?: string
  tweetUserName?: string
  tweetProfileImage?: string
}

interface QuestionItem extends RelatedQuestion {
  isExpanded: boolean
}

interface RelatedQuestionsProps {
  searchQuery: string
}

export default function RelatedQuestions({ searchQuery }: RelatedQuestionsProps) {
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!searchQuery) {
      setQuestions([])
      setUsedQuestions(new Set())
      return
    }

    const fetchQuestions = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/related-questions?q=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        const newQuestions = (data.questions || []).map((q: RelatedQuestion) => ({ ...q, isExpanded: false }))
        setQuestions(newQuestions)
        setUsedQuestions(new Set(newQuestions.map((q: QuestionItem) => q.question)))
      } catch (e) {
        console.error('Related questions error:', e)
        setQuestions([])
      }
      setIsLoading(false)
    }

    fetchQuestions()
  }, [searchQuery])

  const handleQuestionClick = async (index: number) => {
    const newQuestions = [...questions]
    const question = newQuestions[index]
    
    // 展開/閉じる
    const wasExpanded = question.isExpanded
    question.isExpanded = !question.isExpanded
    setQuestions([...newQuestions])
    
    // 展開時に新しい質問を追加
    if (!wasExpanded) {
      try {
        const offset = questions.length * 4
        const response = await fetch(`/api/related-questions?q=${encodeURIComponent(searchQuery)}&random=1&offset=${offset}`)
        const data = await response.json()
        
        // 重複しない質問だけ追加
        const newItems = (data.questions || [])
          .filter((q: RelatedQuestion) => !usedQuestions.has(q.question))
          .slice(0, 2)
          .map((q: RelatedQuestion) => ({ ...q, isExpanded: false }))
        
        if (newItems.length > 0) {
          // 現在の質問の直後に挿入
          setQuestions(prev => {
            const updated = [...prev]
            updated.splice(index + 1, 0, ...newItems)
            return updated
          })
          
          // 使用済みに追加
          setUsedQuestions(prev => {
            const newUsed = new Set(prev)
            newItems.forEach((q: QuestionItem) => newUsed.add(q.question))
            return newUsed
          })
        }
      } catch (e) {
        console.error('Add questions error:', e)
      }
    }
  }

  if (isLoading || questions.length === 0) {
    return null
  }

  return (
    <div style={{ marginTop: '24px', marginBottom: '24px' }}>
      <div style={{
        fontSize: '18px',
        fontWeight: 400,
        color: 'var(--text-primary)',
        marginBottom: '12px'
      }}>
        関連する質問
      </div>
      
      <div style={{ borderTop: '1px solid var(--border-color)' }}>
        {questions.map((item, index) => (
          <div key={`${item.question}-${index}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => handleQuestionClick(index)}
              style={{
                width: '100%',
                padding: '16px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--text-primary)',
                fontSize: '15px'
              }}
            >
              <span style={{ fontWeight: 500 }}>{item.question}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  transform: item.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                  marginLeft: '12px'
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            
            {item.isExpanded && (
              <div 
                style={{ 
                  paddingBottom: '16px',
                  animation: 'slideDown 0.2s ease-out'
                }}
              >
                {item.answer && (
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    marginBottom: '12px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {item.answer}
                  </p>
                )}
                
                {item.tweetId && item.tweetUserId && (
                  <a
                    href={`https://x.com/${item.tweetUserId}/status/${item.tweetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: 'var(--hover-bg)',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      marginTop: '8px'
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-tertiary)',
                      flexShrink: 0
                    }}>
                      <img
                        src={item.tweetProfileImage || '/default-avatar.svg'}
                        alt={item.tweetUserName || ''}
                        onError={(e) => { e.currentTarget.src = '/default-avatar.svg' }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        x.com › {item.tweetUserId}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--link-color)', fontWeight: 500 }}>
                        {item.tweetUserName} (@{item.tweetUserId})
                      </div>
                    </div>
                  </a>
                )}

                {!item.answer && !item.tweetId && (
                  <Link
                    href={`/search?q=${encodeURIComponent(item.question)}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: 'var(--link-color)',
                      textDecoration: 'none'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    検索結果を見る
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
