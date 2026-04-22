import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import Footer from './components/Footer'
import { WebVitals } from './components/WebVitals'
import { getSiteUrl } from '@/lib/site-url'

const siteUrl = getSiteUrl()

// フォント最適化
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  variable: '--font-noto-sans-jp',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'HikamersSearch - ツイート検索エンジン',
    template: '%s | HikamersSearch'
  },
  description: 'HikamersSearchは高速で正確なツイート検索エンジンです。過去のツイートを簡単に検索・分析できます。音声検索、AI検索機能も搭載。',
  keywords: ['ツイート検索', 'Twitter検索', 'X検索', 'ソーシャルメディア分析', 'ツイート分析', 'HikamersSearch', '音声検索', 'AI検索', 'ヒカマー', 'ヒカキン'],
  authors: [{ name: '十字架_mania', url: 'https://x.com/maebahesioru2' }],
  creator: '十字架_mania',
  publisher: 'HikamersSearch',
  generator: 'Next.js',
  applicationName: 'HikamersSearch',
  referrer: 'origin-when-cross-origin',
  category: 'technology',
  classification: 'Search Engine',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HikamersSearch',
    startupImage: '/icon-512.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#4285f4',
    'msapplication-config': '/browserconfig.xml',
    'apple-mobile-web-app-title': 'HikamersSearch',
    'format-detection': 'telephone=no',
    'google': 'notranslate',
    'rating': 'general',
    'revisit-after': '1 days',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: siteUrl,
    siteName: 'HikamersSearch',
    title: 'HikamersSearch - ツイート検索エンジン',
    description: 'HikamersSearchは高速で正確なツイート検索エンジンです。過去のツイートを簡単に検索・分析できます。',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'HikamersSearch - ツイート検索エンジン',
        type: 'image/png',
      }
    ],
    countryName: 'Japan',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HikamersSearch - ツイート検索エンジン',
    description: 'HikamersSearchは高速で正確なツイート検索エンジンです。過去のツイートを簡単に検索・分析できます。',
    images: ['/twitter-image.png'],
    creator: '@maebahesioru2',
    site: '@maebahesioru2',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Google Search Consoleで取得した認証コードを設定
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'ja': siteUrl,
      'x-default': siteUrl,
    },
    types: {
      'application/rss+xml': '/feed.xml',
      'application/atom+xml': '/atom.xml',
    },
  },
  archives: [`${siteUrl}/download`],
  assets: [`${siteUrl}/icon-512.png`],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning className={notoSansJP.variable}>
      <head>
        {/* DNS Prefetch & Preconnect for performance */}
        <link rel="dns-prefetch" href="https://pbs.twimg.com" />
        <link rel="dns-prefetch" href="https://abs.twimg.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://x.com" />
        <link rel="preconnect" href="https://pbs.twimg.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Prefetch critical pages */}
        <link rel="prefetch" href="/search" />
        <link rel="prefetch" href="/ai" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/logo.png" as="image" />
        
        {/* Site metadata */}
        <link rel="canonical" href={siteUrl} />
        <link rel="author" href="/humans.txt" type="text/plain" />
        
        {/* RSS/Atom フィード */}
        <link rel="alternate" type="application/rss+xml" title="HikamersSearch RSS Feed" href="/feed.xml" />
        <link rel="alternate" type="application/atom+xml" title="HikamersSearch Atom Feed" href="/atom.xml" />
        
        {/* OpenSearch - ブラウザ検索バー対応 */}
        <link rel="search" type="application/opensearchdescription+xml" title="HikamersSearch" href="/opensearch.xml" />
        
        {/* WebFinger/host-meta - フェデレーション対応 */}
        <link rel="lrdd" href="/.well-known/host-meta" type="application/xrd+xml" />
        
        {/* PGP Key */}
        <link rel="pgpkey" href="/pgp-key.txt" type="text/plain" />
        
        {/* OpenAPI/AI Plugin */}
        <link rel="api" href="/openapi.yaml" type="application/x-yaml" />
        <link rel="ai-plugin" href="/.well-known/ai-plugin.json" type="application/json" />
        
        {/* 追加のrel属性 */}
        <link rel="me" href="https://x.com/maebahesioru2" />
        
        {/* プライバシー関連 */}
        <link rel="privacy-policy" href="/about" />
        <link rel="dnt-policy" href="/dnt-policy.txt" />
        
        {/* IndexNow検証キー */}
        <link rel="indexnow" href="/hikamers-indexnow-key-2024.txt" />
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'HikamersSearch',
              url: siteUrl,
              description: 'HikamersSearchは高速で正確なツイート検索エンジンです。過去のツイートを簡単に検索・分析できます。',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${siteUrl}/search?q={search_term_string}`
                },
                'query-input': 'required name=search_term_string'
              },
              inLanguage: 'ja-JP',
              author: {
                '@type': 'Person',
                name: '十字架_mania',
                url: `${siteUrl}/about`,
                sameAs: [
                  'https://x.com/maebahesioru2'
                ]
              },
              publisher: {
                '@type': 'Organization',
                name: 'HikamersSearch',
                url: siteUrl,
                logo: {
                  '@type': 'ImageObject',
                  url: `${siteUrl}/icon-512.png`
                }
              },
              datePublished: '2025-10-27',
              dateModified: new Date().toISOString().split('T')[0]
            })
          }}
        />
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'HikamersSearch',
              url: siteUrl,
              logo: `${siteUrl}/icon-512.png`,
              founder: {
                '@type': 'Person',
                name: '十字架_mania'
              },
              sameAs: [
                'https://x.com/maebahesioru2'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                availableLanguage: 'Japanese'
              }
            })
          }}
        />
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'HikamersSearch',
              applicationCategory: 'WebApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'JPY'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '100'
              },
              featureList: [
                'ツイート検索',
                '音声検索',
                'AI検索',
                'ヒカマーランキング',
                'なりきりAIチャット'
              ]
            })
          }}
        />
        {/* SiteNavigationElement - サイトナビゲーション構造化データ */}
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SiteNavigationElement',
              name: 'メインナビゲーション',
              hasPart: [
                { '@type': 'WebPage', name: 'ホーム', url: siteUrl },
                { '@type': 'WebPage', name: '検索', url: `${siteUrl}/search` },
                { '@type': 'WebPage', name: 'AI検索', url: `${siteUrl}/ai` },
                { '@type': 'WebPage', name: 'ヒカマー表DX', url: `${siteUrl}/hikamer-dx` },
                { '@type': 'WebPage', name: 'FAQ', url: `${siteUrl}/faq` },
                { '@type': 'WebPage', name: '使い方', url: `${siteUrl}/how-to-use` },
                { '@type': 'WebPage', name: '運営者情報', url: `${siteUrl}/about` }
              ]
            })
          }}
        />
        {/* WebPage構造化データ */}
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              '@id': `${siteUrl}/#webpage`,
              url: siteUrl,
              name: 'HikamersSearch - ツイート検索エンジン',
              description: 'HikamersSearchは高速で正確なツイート検索エンジンです。',
              isPartOf: { '@id': `${siteUrl}/#website` },
              inLanguage: 'ja-JP',
              primaryImageOfPage: {
                '@type': 'ImageObject',
                url: `${siteUrl}/icon-512.png`
              },
              speakable: {
                '@type': 'SpeakableSpecification',
                cssSelector: ['h1', '.description', 'main']
              }
            })
          }}
        />
        {/* 拡張SearchAction */}
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': `${siteUrl}/#website`,
              url: siteUrl,
              name: 'HikamersSearch',
              potentialAction: [
                {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${siteUrl}/search?q={search_term}`
                  },
                  'query-input': 'required name=search_term'
                },
                {
                  '@type': 'SearchAction',
                  name: 'AI検索',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${siteUrl}/ai?q={search_term}`
                  },
                  'query-input': 'required name=search_term'
                },
                {
                  '@type': 'SearchAction',
                  name: '画像検索',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${siteUrl}/search?q={search_term}&tbm=isch`
                  },
                  'query-input': 'required name=search_term'
                }
              ]
            })
          }}
        />
        {/* Dataset構造化データ - ツイートデータセット */}
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Dataset',
              name: 'HikamersSearch ツイートデータセット',
              description: 'HikamersSearchで検索可能なツイートデータのコレクション。30万件以上のツイートを収録。',
              url: `${siteUrl}/download`,
              keywords: ['ツイート', 'Twitter', 'X', 'ソーシャルメディア', 'データセット'],
              creator: {
                '@type': 'Person',
                name: '十字架_mania',
                url: 'https://x.com/maebahesioru2'
              },
              distribution: {
                '@type': 'DataDownload',
                encodingFormat: 'text/tab-separated-values',
                contentUrl: `${siteUrl}/download`
              },
              temporalCoverage: '2022/2026',
              variableMeasured: [
                { '@type': 'PropertyValue', name: 'ツイート数', value: '300000+' },
                { '@type': 'PropertyValue', name: 'データ形式', value: 'TSV' }
              ],
              license: `${siteUrl}/about`,
              isAccessibleForFree: true
            })
          }}
        />
        {/* VideoObject構造化データテンプレート - 動画付きツイート用 */}
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'VideoGallery',
              name: 'ヒカマー界隈の動画ツイート',
              description: 'ヒカマー界隈で投稿された動画付きツイートのコレクション',
              url: `${siteUrl}/search?tbm=vid`,
              isPartOf: {
                '@type': 'WebSite',
                name: 'HikamersSearch',
                url: siteUrl
              }
            })
          }}
        />
        {/* LocalBusiness構造化データ（サービスとして） */}
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'OnlineBusiness',
              name: 'HikamersSearch',
              description: 'ヒカマー界隈のツイート検索サービス',
              url: siteUrl,
              logo: `${siteUrl}/icon-512.png`,
              foundingDate: '2025-10-27',
              founder: {
                '@type': 'Person',
                name: '十字架_mania'
              },
              areaServed: 'JP',
              serviceType: 'ツイート検索サービス',
              priceRange: '無料'
            })
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else if (theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
        {/* GPC (Global Privacy Control) サポート */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (navigator.globalPrivacyControl) {
                console.log('GPC signal detected - respecting user privacy preferences');
              }
            `,
          }}
        />
      </head>
      <body className={notoSansJP.className}>
        <WebVitals />
        {/* スキップリンク - アクセシビリティ */}
        <a
          href="#main-content"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 'auto',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
          className="skip-link"
        >
          メインコンテンツへスキップ
        </a>
        {children}
        <Footer />
              <script src="https://hikakinmaniacoin.hikamer.f5.si/ad.js" async></script>
      </body>
    </html>
  )
}
