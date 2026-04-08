import { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site-url'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'ヒカマー表DX - ヒカマーランキング＆なりきりAI',
  description: 'ヒカマー界隈の活躍度ランキング。いいね数、RT数、フォロワー数などで順位付け。なりきりAIチャット、グループチャット、AIバトル機能も搭載。',
  keywords: ['ヒカマー', 'ヒカキン', 'ランキング', 'なりきりAI', 'AIチャット', 'Twitter分析'],
  openGraph: {
    title: 'ヒカマー表DX - ヒカマーランキング＆なりきりAI',
    description: 'ヒカマー界隈の活躍度ランキング。なりきりAIチャット、グループチャット、AIバトル機能も搭載。',
    type: 'website',
    url: `${siteUrl}/hikamer-dx`,
  },
  twitter: {
    card: 'summary',
    title: 'ヒカマー表DX',
    description: 'ヒカマー界隈の活躍度ランキング＆なりきりAI',
  },
  alternates: {
    canonical: `${siteUrl}/hikamer-dx`,
    languages: {
      'ja': `${siteUrl}/hikamer-dx`,
      'x-default': `${siteUrl}/hikamer-dx`,
    },
  },
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
      name: 'ヒカマー表DX',
      item: `${siteUrl}/hikamer-dx`
    }
  ]
}

// WebApplication構造化データ
const webAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ヒカマー表DX',
  description: 'ヒカマー界隈の活躍度ランキング＆なりきりAI',
  url: `${siteUrl}/hikamer-dx`,
  applicationCategory: 'SocialNetworkingApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY'
  },
  featureList: [
    'ヒカマーランキング',
    'なりきりAIチャット',
    'グループチャット',
    'AIバトル・漫才・コント生成'
  ]
}

// ItemList構造化データ（ランキング用）
const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'ヒカマーランキング',
  description: 'ヒカマー界隈で活躍するユーザーのランキング',
  url: `${siteUrl}/hikamer-dx`,
  itemListOrder: 'https://schema.org/ItemListOrderDescending',
  numberOfItems: 100
}

// Action構造化データ（機能へのリンク）
const actionsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'ヒカマー表DX',
  url: `${siteUrl}/hikamer-dx`,
  potentialAction: [
    {
      '@type': 'ViewAction',
      name: 'ランキングを見る',
      target: `${siteUrl}/hikamer-dx`
    },
    {
      '@type': 'InteractAction',
      name: 'なりきりAIとチャット',
      target: `${siteUrl}/hikamer-dx/chat`
    },
    {
      '@type': 'InteractAction',
      name: 'グループチャット',
      target: `${siteUrl}/hikamer-dx/group`
    },
    {
      '@type': 'InteractAction',
      name: 'AIバトル',
      target: `${siteUrl}/hikamer-dx/battle`
    }
  ]
}

export default function HikamerDXLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(actionsJsonLd) }}
      />
      {children}
    </>
  )
}
