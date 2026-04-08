import { Metadata } from 'next'
import Link from 'next/link'
import styles from '../page.module.css'
import { getSiteUrl } from '@/lib/site-url'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: '運営者情報',
  description: 'HikamersSearchの運営者情報、サービス概要、お問い合わせ先について。',
  keywords: ['運営者情報', 'HikamersSearch', '十字架_mania', 'お問い合わせ'],
  openGraph: {
    title: '運営者情報 | HikamersSearch',
    description: 'HikamersSearchの運営者情報、サービス概要、お問い合わせ先について。',
    type: 'profile',
    url: `${siteUrl}/about`,
  },
  twitter: {
    card: 'summary',
    title: '運営者情報 | HikamersSearch',
    description: 'HikamersSearchの運営者情報、サービス概要、お問い合わせ先について。',
  },
  alternates: {
    canonical: `${siteUrl}/about`,
  },
}

// 構造化データ
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: '十字架_mania',
  url: `${siteUrl}/about`,
  sameAs: [
    'https://x.com/maebahesioru2'
  ],
  jobTitle: 'Developer',
  worksFor: {
    '@type': 'Organization',
    name: 'HikamersSearch'
  }
}

// ProfilePage構造化データ
const profilePageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  name: '十字架_mania - 運営者プロフィール',
  description: 'HikamersSearchの運営者、十字架_maniaのプロフィールページ',
  url: `${siteUrl}/about`,
  mainEntity: {
    '@type': 'Person',
    '@id': `${siteUrl}/about#person`,
    name: '十字架_mania',
    alternateName: 'maebahesioru2',
    url: `${siteUrl}/about`,
    image: `${siteUrl}/icon-512.png`,
    sameAs: [
      'https://x.com/maebahesioru2'
    ],
    jobTitle: 'Developer',
    description: 'HikamersSearchの開発者・運営者',
    knowsAbout: ['Web開発', 'ツイート検索', 'AI', 'Next.js'],
    worksFor: {
      '@type': 'Organization',
      name: 'HikamersSearch',
      url: siteUrl
    }
  },
  dateCreated: '2025-10-27',
  dateModified: new Date().toISOString().split('T')[0],
  isPartOf: {
    '@type': 'WebSite',
    name: 'HikamersSearch',
    url: siteUrl
  }
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'ホーム',
      item: siteUrl
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '運営者情報',
      item: `${siteUrl}/about`
    }
  ]
}

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className={styles.container}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {/* パンくずリスト */}
        <nav aria-label="パンくずリスト" style={{ marginBottom: '20px', fontSize: '14px' }}>
          <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <li><Link href="/" style={{ color: 'var(--link-color)' }}>ホーム</Link></li>
            <li style={{ color: 'var(--text-secondary)' }}>/</li>
            <li style={{ color: 'var(--text-secondary)' }}>運営者情報</li>
          </ol>
        </nav>
        
        <h1 style={{ fontSize: '32px', marginBottom: '30px', color: 'var(--text-primary)' }}>運営者情報</h1>
        
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>サービス名</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>HikamersSearch（ヒカマーズサーチ）</p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>サービス概要</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            HikamersSearchは、過去のツイートを高速かつ正確に検索できる検索エンジンです。
            音声検索機能やAI検索機能を搭載し、より直感的で効率的な情報検索を実現します。
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>運営者</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>十字架_mania</p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>お問い合わせ</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            サービスに関するお問い合わせは、Twitter/X: <a href="https://x.com/maebahesioru2" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link-color)' }}>@maebahesioru2</a> までお願いします。
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>SNS</h2>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <li><a href="https://x.com/maebahesioru2" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link-color)' }}>@maebahesioru2</a></li>
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>更新履歴</h2>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <li>2025年10月: AI検索機能リリース</li>
            <li>2025年10月: 音声検索機能追加</li>
            <li>2025年10月: サービス開始</li>
          </ul>
        </section>
        
        {/* 関連ページ */}
        <nav aria-label="関連ページ" style={{ marginTop: '40px', padding: '24px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>関連ページ</h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <li><Link href="/faq" style={{ color: 'var(--link-color)' }}>よくある質問</Link></li>
            <li><Link href="/how-to-use" style={{ color: 'var(--link-color)' }}>使い方ガイド</Link></li>
            <li><Link href="/download" style={{ color: 'var(--link-color)' }}>データダウンロード</Link></li>
          </ul>
        </nav>
      </div>
    </div>
    </>
  )
}
