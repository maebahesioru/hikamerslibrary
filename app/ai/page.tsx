import { Metadata } from 'next'
import { Suspense } from 'react'
import AiPage from './AiPage'
import { getSiteUrl } from '@/lib/site-url'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'AI検索モード',
  description: 'AIを活用した高度なツイート検索。自然言語で質問して、関連するツイートを見つけましょう。',
  keywords: ['AI検索', 'ツイート検索', '自然言語検索', 'ChatGPT', 'Gemini'],
  openGraph: {
    title: 'AI検索モード | HikamersSearch',
    description: 'AIを活用した高度なツイート検索。自然言語で質問して、関連するツイートを見つけましょう。',
    type: 'website',
    url: `${siteUrl}/ai`,
  },
  twitter: {
    card: 'summary',
    title: 'AI検索モード | HikamersSearch',
    description: 'AIを活用した高度なツイート検索。自然言語で質問して、関連するツイートを見つけましょう。',
  },
  alternates: {
    canonical: `${siteUrl}/ai`,
    languages: {
      'ja': `${siteUrl}/ai`,
      'x-default': `${siteUrl}/ai`,
    },
  },
}

// 構造化データ
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'HikamersSearch AI検索',
  description: 'AIを活用した高度なツイート検索。自然言語で質問して、関連するツイートを見つけましょう。',
  url: `${siteUrl}/ai`,
  applicationCategory: 'SearchApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY'
  }
}

// BreadcrumbList構造化データ
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
      name: 'AI検索',
      item: `${siteUrl}/ai`
    }
  ]
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense fallback={<div>読み込み中...</div>}>
        <AiPage />
      </Suspense>
    </>
  )
}
