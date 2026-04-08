import Link from 'next/link'
import { getSiteUrl } from '@/lib/site-url'

export default function Footer() {
  const siteUrl = getSiteUrl()
  const currentYear = new Date().getFullYear()
  
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      padding: '40px 20px',
      marginTop: '80px',
      background: 'var(--bg-primary)'
    }}
    role="contentinfo"
    aria-label="サイトフッター"
    itemScope
    itemType="https://schema.org/WPFooter"
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '40px'
      }}>
        <div itemScope itemType="https://schema.org/Organization">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
            <span itemProp="name">HikamersSearch</span>
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }} itemProp="description">
            高速で正確なツイート検索エンジン
          </p>
          <meta itemProp="url" content={siteUrl} />
          <meta itemProp="logo" content={`${siteUrl}/icon-512.png`} />
        </div>
        
        <nav aria-label="機能メニュー">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
            機能
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '8px' }}>
              <Link href="/search" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                ツイート検索
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <Link href="/ai" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                AI検索
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <Link href="/hikamer-dx" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                ヒカマー表DX
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <Link href="/hikamer-dx/chat" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                なりきりAIチャット
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <Link href="/hikamer-dx/group" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                グループチャット
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <Link href="/hikamer-dx/battle" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                なりきりAIバトル
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <Link href="/hikamer-dx/quiz" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                ヒカマニクイズ
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }}>
            </li>
          </ul>
        </nav>
        
        <nav aria-label="情報メニュー">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
            情報
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '8px' }}>
              <Link href="/about" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                運営者情報
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <Link href="/download" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                データセットダウンロード
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <Link href="/faq" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                よくある質問
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <Link href="/how-to-use" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                使い方ガイド
              </Link>
            </li>
          </ul>
        </nav>
        
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
            リソース
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '8px' }}>
              <a 
                href="https://x.com/maebahesioru2" 
                target="_blank" 
                rel="noopener noreferrer me"
                style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}
                aria-label="X（Twitter）で@maebahesioru2をフォロー"
              >
                X (Twitter)
              </a>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <Link href="/feed.xml" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                RSS フィード
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <Link href="/sitemap.xml" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                サイトマップ
              </Link>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <a 
                href="/.well-known/security.txt" 
                style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                セキュリティ
              </a>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <a 
                href="/dnt-policy.txt" 
                style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                プライバシー
              </a>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <a 
                href="/pgp-key.txt" 
                style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                PGP Key
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '40px auto 0',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: '14px',
        color: 'var(--text-secondary)'
      }}>
        <p style={{ margin: 0 }}>
          <small>© {currentYear} HikamersSearch. All rights reserved.</small>
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '12px' }}>
          <a 
            href="https://ja.textstudio.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            ロゴ作成: フォントジェネレーター
          </a>
        </p>
      </div>
    </footer>
  )
}
