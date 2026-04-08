'use client'

import Link from 'next/link'
import { getSiteUrl } from '@/lib/site-url'

interface BreadcrumbItem {
  name: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const origin = getSiteUrl()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href ? `${origin}${item.href}` : undefined
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav 
        aria-label="パンくずリスト" 
        style={{ 
          marginBottom: '20px', 
          fontSize: '14px',
          padding: '8px 0'
        }}
      >
        <ol 
          style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          {items.map((item, index) => (
            <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {index > 0 && (
                <span style={{ color: 'var(--text-tertiary)' }} aria-hidden="true">/</span>
              )}
              {item.href ? (
                <Link 
                  href={item.href} 
                  style={{ 
                    color: 'var(--link-color)',
                    textDecoration: 'none'
                  }}
                >
                  {item.name}
                </Link>
              ) : (
                <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
