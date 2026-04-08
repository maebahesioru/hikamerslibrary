'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RelatedSearchesProps {
  searchQuery: string
}

export default function RelatedSearches({ searchQuery }: RelatedSearchesProps) {
  const [searches, setSearches] = useState<string[]>([])

  useEffect(() => {
    if (!searchQuery) {
      setSearches([])
      return
    }

    const fetchSearches = async () => {
      try {
        const response = await fetch(`/api/related-searches?q=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        console.log('RelatedSearches response:', data)
        setSearches(data.searches || [])
      } catch (e) {
        console.error('Related searches error:', e)
        setSearches([])
      }
    }

    fetchSearches()
  }, [searchQuery])

  if (searches.length === 0) {
    return null
  }

  return (
    <div style={{ marginTop: '32px', marginBottom: '24px' }}>
      <div style={{
        fontSize: '18px',
        fontWeight: 400,
        color: 'var(--text-primary)',
        marginBottom: '16px'
      }}>
        他の人はこちらも検索
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }}>
        {searches.map((search, index) => (
          <Link
            key={index}
            href={`/search?q=${encodeURIComponent(search)}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          >
            <span style={{
              fontSize: '14px',
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {search}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-tertiary)"
              strokeWidth="2"
              style={{ flexShrink: 0, marginLeft: '8px' }}
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
