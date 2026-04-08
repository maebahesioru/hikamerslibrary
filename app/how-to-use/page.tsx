import { Metadata } from 'next'
import Link from 'next/link'
import styles from '../page.module.css'
import { getSiteUrl } from '@/lib/site-url'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: '使い方ガイド',
  description: 'HikamersSearchの使い方を詳しく解説。検索方法、AI検索、音声検索、ヒカマー表DXの使い方など。',
  keywords: ['使い方', 'ガイド', 'HikamersSearch', 'ヘルプ', 'チュートリアル'],
  openGraph: {
    title: '使い方ガイド | HikamersSearch',
    description: 'HikamersSearchの使い方を詳しく解説。',
    type: 'website',
    url: `${siteUrl}/how-to-use`,
  },
  alternates: {
    canonical: `${siteUrl}/how-to-use`,
    languages: {
      'ja': `${siteUrl}/how-to-use`,
      'x-default': `${siteUrl}/how-to-use`,
    },
  },
}

const howToSearch = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'HikamersSearchでツイートを検索する方法',
  description: 'HikamersSearchを使ってヒカマー界隈のツイートを検索する手順',
  totalTime: 'PT1M',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: '検索ページにアクセス',
      text: 'HikamersSearchのトップページまたは検索ページにアクセスします。',
      url: siteUrl
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'キーワードを入力',
      text: '検索ボックスに検索したいキーワードを入力します。ユーザー名、ツイート内容、ハッシュタグなどで検索できます。',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: '検索を実行',
      text: 'Enterキーを押すか「ヒカマー検索」ボタンをクリックして検索を実行します。',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: '結果を確認',
      text: '検索結果が表示されます。画像タブや動画タブで絞り込むこともできます。',
    }
  ]
}

const howToAiSearch = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'AI検索モードの使い方',
  description: '自然言語でツイートを検索するAI検索モードの使い方',
  totalTime: 'PT2M',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'AI検索モードに切り替え',
      text: '検索ボックス横の「AIモード」ボタンをクリックするか、/ai ページにアクセスします。',
      url: `${siteUrl}/ai`
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: '質問を入力',
      text: '「昨日バズったツイートは？」「〇〇さんの最近のツイートを教えて」のように自然な言葉で質問します。',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'AIの回答を確認',
      text: 'AIが関連するツイートを分析し、回答を生成します。関連ツイートも一緒に表示されます。',
    }
  ]
}

const howToVoiceSearch = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: '音声検索の使い方',
  description: '音声でツイートを検索する方法',
  totalTime: 'PT30S',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'マイクボタンをクリック',
      text: '検索ボックス内のマイクアイコンをクリックします。',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'マイクを許可',
      text: 'ブラウザからマイクの使用許可を求められたら「許可」をクリックします。',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: '検索ワードを話す',
      text: '検索したいキーワードをマイクに向かって話します。',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: '自動で検索',
      text: '音声が認識されると自動的に検索ボックスに入力され、検索が実行されます。',
    }
  ]
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'ホーム', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: '使い方ガイド', item: `${siteUrl}/how-to-use` }
  ]
}

export default function HowToUsePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSearch) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToAiSearch) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToVoiceSearch) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      
      <div className={styles.container}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
          {/* パンくずリスト */}
          <nav aria-label="パンくずリスト" style={{ marginBottom: '20px', fontSize: '14px' }}>
            <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <li><Link href="/" style={{ color: 'var(--link-color)' }}>ホーム</Link></li>
              <li style={{ color: 'var(--text-secondary)' }}>/</li>
              <li style={{ color: 'var(--text-secondary)' }}>使い方ガイド</li>
            </ol>
          </nav>

          <h1 style={{ fontSize: '32px', marginBottom: '30px', color: 'var(--text-primary)' }}>使い方ガイド</h1>
          
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>🔍 基本的な検索方法</h2>
            <ol style={{ color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li>トップページまたは検索ページにアクセス</li>
              <li>検索ボックスにキーワードを入力（ユーザー名、ツイート内容、ハッシュタグなど）</li>
              <li>Enterキーまたは「ヒカマー検索」ボタンで検索実行</li>
              <li>画像・動画タブで絞り込み可能</li>
            </ol>
            <div style={{ marginTop: '16px' }}>
              <Link href="/search" style={{ color: 'var(--link-color)' }}>→ 検索ページへ</Link>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>✨ AI検索モード</h2>
            <ol style={{ color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li>「AIモード」ボタンをクリック</li>
              <li>自然な言葉で質問（例：「昨日バズったツイートは？」）</li>
              <li>AIが分析して回答を生成</li>
            </ol>
            <div style={{ marginTop: '16px' }}>
              <Link href="/ai" style={{ color: 'var(--link-color)' }}>→ AI検索ページへ</Link>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>🎤 音声検索</h2>
            <ol style={{ color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li>マイクアイコンをクリック</li>
              <li>ブラウザのマイク許可を承認</li>
              <li>検索ワードを話す</li>
              <li>自動で検索実行</li>
            </ol>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>🏆 ヒカマー表DX</h2>
            <ol style={{ color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li>ヒカマー表DXページにアクセス</li>
              <li>ランキング項目を選択（いいね、RT、フォロワー数など）</li>
              <li>期間を指定（全期間、年別、日付範囲）</li>
              <li>表示モードを切り替え（表彰台、グリッド、リスト）</li>
            </ol>
            <div style={{ marginTop: '16px' }}>
              <Link href="/hikamer-dx" style={{ color: 'var(--link-color)' }}>→ ヒカマー表DXへ</Link>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>💬 なりきりAIチャット</h2>
            <ol style={{ color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li>ヒカマー表DXでユーザーの💬ボタンをクリック</li>
              <li>または直接チャットページにアクセス</li>
              <li>ユーザーを選択してチャット開始</li>
              <li>AIがそのユーザーになりきって返答</li>
            </ol>
            <div style={{ marginTop: '16px' }}>
              <Link href="/hikamer-dx/chat" style={{ color: 'var(--link-color)' }}>→ なりきりAIチャットへ</Link>
            </div>
          </section>

          {/* 関連ページ */}
          <nav aria-label="関連ページ" style={{ marginTop: '60px', padding: '24px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>関連ページ</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <li><Link href="/faq" style={{ color: 'var(--link-color)' }}>よくある質問</Link></li>
              <li><Link href="/about" style={{ color: 'var(--link-color)' }}>運営者情報</Link></li>
              <li><Link href="/download" style={{ color: 'var(--link-color)' }}>データダウンロード</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
