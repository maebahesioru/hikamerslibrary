import { Metadata } from 'next'
import { Suspense } from 'react'
import SearchPage from './SearchPage'
import { getSiteUrl } from '@/lib/site-url'

const siteUrl = getSiteUrl()

interface Props {
  searchParams: Promise<{ q?: string; start?: string; tbm?: string }>
}

// 動的メタデータ生成
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const query = params.q || ''
  const start = parseInt(params.start || '0')
  const page = Math.floor(start / 10) + 1
  
  const baseUrl = getSiteUrl()
  
  if (!query) {
    return {
      title: 'ツイート検索',
      description: 'HikamersSearchでツイートを検索。高速で正確な検索結果を提供します。音声検索にも対応。',
      keywords: ['ツイート検索', 'Twitter検索', 'X検索', '音声検索', 'ヒカマー'],
      alternates: {
        canonical: `${baseUrl}/search`,
      },
    }
  }
  
  const title = page > 1 
    ? `「${query}」の検索結果 - ページ${page}` 
    : `「${query}」の検索結果`
  
  const description = `「${query}」に関するツイートの検索結果${page > 1 ? `（ページ${page}）` : ''}。HikamersSearchで高速検索。`
  
  // ページネーション用のcanonical/prev/next
  const canonicalUrl = page > 1 
    ? `${baseUrl}/search?q=${encodeURIComponent(query)}&start=${start}`
    : `${baseUrl}/search?q=${encodeURIComponent(query)}`
  
  // prev/next URLs
  const prevUrl = page > 1 
    ? `${baseUrl}/search?q=${encodeURIComponent(query)}&start=${(page - 2) * 10}`
    : undefined
  const nextUrl = `${baseUrl}/search?q=${encodeURIComponent(query)}&start=${page * 10}`
  
  // other に prev/next を設定
  const otherMeta: Record<string, string> = {}
  if (prevUrl) otherMeta['prev'] = prevUrl
  otherMeta['next'] = nextUrl
  // AMPページへのリンク
  otherMeta['amphtml'] = `${baseUrl}/amp/search?q=${encodeURIComponent(query)}`
  
  return {
    title,
    description,
    keywords: [query, 'ツイート検索', 'Twitter検索', 'X検索', 'ヒカマー'],
    openGraph: {
      title: `${title} | HikamersSearch`,
      description,
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary',
      title: `${title} | HikamersSearch`,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ja': canonicalUrl,
        'x-default': canonicalUrl,
      },
    },
    robots: {
      index: page <= 5, // 5ページ目以降はnoindex
      follow: true,
    },
    other: otherMeta,
  }
}

// 構造化データ - SearchResultsPage
const searchResultsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SearchResultsPage',
  name: 'HikamersSearch - ツイート検索',
  description: 'HikamersSearchでツイートを検索。高速で正確な検索結果を提供します。',
  url: `${siteUrl}/search`,
  mainEntity: {
    '@type': 'WebSite',
    name: 'HikamersSearch',
    url: siteUrl
  }
}

// CollectionPage構造化データ - 検索結果コレクション
const collectionPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'ツイート検索結果',
  description: 'HikamersSearchのツイート検索結果ページ。キーワードに関連するツイートを一覧表示します。',
  url: `${siteUrl}/search`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'HikamersSearch',
    url: siteUrl
  },
  breadcrumb: {
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
        name: '検索',
        item: `${siteUrl}/search`
      }
    ]
  },
  mainContentOfPage: {
    '@type': 'WebPageElement',
    cssSelector: '.search-results'
  }
}

// ImageObject構造化データ - 画像検索用
const imageSearchJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  name: 'ツイート画像検索',
  description: 'ツイートに含まれる画像を検索・閲覧できます。',
  url: `${siteUrl}/search?tbm=isch`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'HikamersSearch',
    url: siteUrl
  }
}

export default function Search() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchResultsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageSearchJsonLd) }}
      />
      <Suspense fallback={<div>読み込み中...</div>}>
        <SearchPage />
      </Suspense>
    </>
  )
}
