'use client'

import { useState, useEffect } from 'react'

interface Suggestion {
  query: string
  search_count: number
}

interface SearchSuggestionsProps {
  isVisible: boolean
  onSelect: (query: string) => void
  inputValue: string
}

export default function SearchSuggestions({ isVisible, onSelect, inputValue }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/suggestions')
      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible || suggestions.length === 0) {
    return null
  }

  // 入力値でフィルタリング（入力がある場合）
  const filteredSuggestions = inputValue.trim()
    ? suggestions.filter(s => s.query.toLowerCase().includes(inputValue.toLowerCase()))
    : suggestions

  if (filteredSuggestions.length === 0) {
    return null
  }

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: '24px',
      marginTop: '8px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      zIndex: 1000,
      maxHeight: '400px',
      overflowY: 'auto'
    }}>
      {!inputValue.trim() && (
        <div style={{
          padding: '12px 20px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          fontWeight: '600',
          borderBottom: '1px solid var(--border-color)'
        }}>
          急上昇ワード
        </div>
      )}
      {filteredSuggestions.map((suggestion, index) => (
        <div
          key={index}
          onClick={() => onSelect(suggestion.query)}
          style={{
            padding: '12px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'background-color 0.2s',
            borderBottom: index < filteredSuggestions.length - 1 ? '1px solid var(--border-color)' : 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-primary)'
            }}>
              {suggestion.query}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
