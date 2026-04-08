import { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'
import { getSiteUrl } from '@/lib/site-url'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'ページが見つかりません (404)',
  description: 'お探しのページは見つかりませんでした。HikamersSearchのホームページから検索をお試しください。',
  robots: {
    index: false,
    follow: true,
  },
}

// 構造化データ
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: '404 Not Found' }
  ]
}

export default function NotFound() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
            404
          </h1>
          <h2 style={{ 
            fontSize: '24px', 
            color: 'var(--text-secondary)',
            marginTop: '20px',
            marginBottom: '20px'
          }}>
            ページが見つかりませんでした
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '30px',
            maxWidth: '500px',
            lineHeight: 1.6
          }}>
            お探しのページは削除されたか、URLが変更された可能性があります。
          </p>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
            <Link 
              href="/"
              style={{
                padding: '12px 24px',
                background: '#4285f4',
                color: 'white',
                borderRadius: '24px',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              ホームに戻る
            </Link>
            <Link 
              href="/search"
              style={{
                padding: '12px 24px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                borderRadius: '24px',
                textDecoration: 'none',
                fontWeight: 500,
                border: '1px solid var(--border-color)',
              }}
            >
              検索ページ
            </Link>
          </div>

          {/* おすすめコンテンツ */}
          <section style={{ marginTop: '20px', width: '100%', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px' }}>
              おすすめコンテンツ
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '12px',
              textAlign: 'left'
            }}>
              <Link href="/ai" style={{ 
                padding: '16px', 
                background: 'var(--bg-secondary)', 
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>✨</div>
                <div style={{ fontWeight: 500 }}>AI検索</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>自然言語で検索</div>
              </Link>
              <Link href="/hikamer-dx" style={{ 
                padding: '16px', 
                background: 'var(--bg-secondary)', 
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
                <div style={{ fontWeight: 500 }}>ヒカマー表DX</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ランキング</div>
              </Link>
              <Link href="/hikamer-dx/chat" style={{ 
                padding: '16px', 
                background: 'var(--bg-secondary)', 
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
                <div style={{ fontWeight: 500 }}>AIチャット</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>なりきり会話</div>
              </Link>
            </div>
          </section>

          {/* 人気のページ */}
          <nav aria-label="人気のページ" style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              その他のページ
            </h3>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '12px', 
              justifyContent: 'center' 
            }}>
              <li><Link href="/hikamer-dx/battle" style={{ color: 'var(--link-color)' }}>AI創作</Link></li>
              <li><Link href="/download" style={{ color: 'var(--link-color)' }}>データダウンロード</Link></li>
              <li><Link href="/how-to-use" style={{ color: 'var(--link-color)' }}>使い方</Link></li>
              <li><Link href="/faq" style={{ color: 'var(--link-color)' }}>FAQ</Link></li>
              <li><Link href="/about" style={{ color: 'var(--link-color)' }}>運営者情報</Link></li>
            </ul>
          </nav>
        </div>
      </main>
    </>
  )
}
