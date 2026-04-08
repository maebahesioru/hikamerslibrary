'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main id="main-content" className={styles.container} role="main">
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1 style={{ 
          fontSize: '120px', 
          fontWeight: 'bold', 
          color: 'var(--text-primary)',
          margin: 0,
          lineHeight: 1
        }}>
          500
        </h1>
        <h2 style={{ 
          fontSize: '24px', 
          color: 'var(--text-secondary)',
          marginTop: '20px',
          marginBottom: '20px'
        }}>
          エラーが発生しました
        </h2>
        <p style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: '30px',
          maxWidth: '500px',
          lineHeight: 1.6
        }}>
          申し訳ございません。予期しないエラーが発生しました。
          もう一度お試しください。
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '12px 24px',
              background: '#4285f4',
              color: 'white',
              borderRadius: '24px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '16px',
            }}
            aria-label="ページを再読み込み"
          >
            もう一度試す
          </button>
          <Link
            href="/"
            style={{
              padding: '12px 24px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              borderRadius: '24px',
              border: '1px solid var(--border-color)',
              fontWeight: 500,
              fontSize: '16px',
              textDecoration: 'none',
            }}
          >
            ホームに戻る
          </Link>
        </div>
        
        {/* 内部リンク - SEO用 */}
        <nav aria-label="他のページ" style={{ marginTop: '20px' }}>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '12px', 
            justifyContent: 'center',
            fontSize: '14px'
          }}>
            <li><Link href="/search" style={{ color: 'var(--link-color)' }}>検索</Link></li>
            <li><Link href="/ai" style={{ color: 'var(--link-color)' }}>AI検索</Link></li>
            <li><Link href="/faq" style={{ color: 'var(--link-color)' }}>FAQ</Link></li>
          </ul>
        </nav>
      </div>
    </main>
  )
}
