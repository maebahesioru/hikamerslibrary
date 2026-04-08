import { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site-url'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'データセットダウンロード',
  description: 'ヒカマー界隈のツイートデータをTSV形式でダウンロード。30万件以上のツイートデータを無料で取得できます。',
  keywords: ['ツイートデータ', 'データセット', 'ダウンロード', 'TSV', 'Twitter', 'ヒカマー'],
  openGraph: {
    title: 'データセットダウンロード | HikamersSearch',
    description: 'ヒカマー界隈のツイートデータをTSV形式でダウンロード。30万件以上のツイートデータを無料で取得。',
    type: 'website',
    url: `${siteUrl}/download`,
  },
  twitter: {
    card: 'summary',
    title: 'データセットダウンロード',
    description: 'ヒカマー界隈のツイートデータをTSV形式でダウンロード',
  },
  alternates: {
    canonical: `${siteUrl}/download`,
    languages: {
      'ja': `${siteUrl}/download`,
      'x-default': `${siteUrl}/download`,
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
      name: 'データダウンロード',
      item: `${siteUrl}/download`
    }
  ]
}

// Dataset構造化データ
const datasetJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'ヒカマー界隈ツイートデータセット',
  description: 'ヒカマー界隈のツイートを収集したデータセット。ツイートID、投稿日時、ユーザー情報、エンゲージメント数などを含む。',
  url: `${siteUrl}/download`,
  keywords: ['ツイート', 'Twitter', 'X', 'ヒカマー', 'ソーシャルメディア'],
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
  isAccessibleForFree: true,
  license: `${siteUrl}/about`
}

// DataCatalog構造化データ
const dataCatalogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'DataCatalog',
  name: 'HikamersSearch データカタログ',
  description: 'ヒカマー界隈のツイートデータを年別・日別でダウンロード可能',
  url: `${siteUrl}/download`,
  dataset: {
    '@type': 'Dataset',
    name: 'ヒカマー界隈ツイートデータセット'
  }
}

export default function DownloadLayout({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dataCatalogJsonLd) }}
      />
      {children}
    </>
  )
}
