import { Metadata } from 'next'
import Link from 'next/link'
import styles from '../page.module.css'
import { getSiteUrl } from '@/lib/site-url'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'よくある質問（FAQ）',
  description: 'HikamersSearchに関するよくある質問と回答。使い方、機能、トラブルシューティングなど。',
  keywords: ['FAQ', 'よくある質問', 'HikamersSearch', '使い方', 'ヘルプ'],
  openGraph: {
    title: 'よくある質問（FAQ） | HikamersSearch',
    description: 'HikamersSearchに関するよくある質問と回答。',
    type: 'website',
    url: `${siteUrl}/faq`,
  },
  twitter: {
    card: 'summary',
    title: 'よくある質問（FAQ）',
    description: 'HikamersSearchに関するよくある質問と回答。',
  },
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
}

const faqs = [
  {
    question: 'HikamersSearchとは何ですか？',
    answer: 'HikamersSearchは、ヒカマー界隈の過去のツイートを高速かつ正確に検索できる検索エンジンです。通常の検索に加えて、音声検索やAI検索機能も搭載しています。'
  },
  {
    question: '音声検索はどのように使いますか？',
    answer: '検索ボックス内のマイクアイコンをクリックして、音声で検索キーワードを入力できます。Chrome、Edge、Safariなどの主要ブラウザで利用可能です。'
  },
  {
    question: 'AI検索モードとは何ですか？',
    answer: 'AI検索モードでは、自然言語で質問することができます。例えば「昨日バズったツイートは？」のように聞くと、AIが関連するツイートを分析して回答します。'
  },
  {
    question: 'ヒカマー表DXとは何ですか？',
    answer: 'ヒカマー界隈で活躍しているユーザーのランキングです。いいね数、RT数、フォロワー数など様々な指標でソートできます。なりきりAIチャット機能も搭載しています。'
  },
  {
    question: 'なりきりAIチャットとは何ですか？',
    answer: 'ヒカマー表DXに登録されているユーザーになりきったAIとチャットできる機能です。過去のツイートを学習し、そのユーザーの口調や話題で会話します。'
  },
  {
    question: 'グループチャットはどう使いますか？',
    answer: '複数のヒカマーを選択して、グループでの会話をシミュレーションできます。最大5人まで参加可能で、AIがそれぞれのキャラクターになりきって会話します。'
  },
  {
    question: 'AIバトル・創作機能とは？',
    answer: '2人のヒカマーを選んで、漫才、コント、ラップバトル、討論などをAIに生成させる機能です。お題を指定することもできます。'
  },
  {
    question: '検索結果が表示されない場合はどうすればいいですか？',
    answer: 'ブラウザのキャッシュをクリアするか、ページを再読み込みしてください。それでも解決しない場合は、別のブラウザで試してみてください。'
  },
  {
    question: 'どのブラウザで利用できますか？',
    answer: 'Chrome、Edge、Safari、Firefoxなどの主要な最新ブラウザで利用できます。最適な体験のため、最新バージョンのブラウザをご使用ください。'
  },
  {
    question: 'モバイルでも使えますか？',
    answer: 'はい、スマートフォンやタブレットでも快適に利用できます。PWA（Progressive Web App）として、ホーム画面に追加してアプリのように使うこともできます。'
  },
  {
    question: '検索履歴は保存されますか？',
    answer: 'AI検索モードの会話履歴はブラウザのローカルストレージに保存されます。サーバーには送信されません。履歴はいつでもクリアできます。'
  },
  {
    question: 'データはどこから取得していますか？',
    answer: 'X（旧Twitter）の公開ツイートを収集・保存しています。データは定期的に更新されています。'
  },
  {
    question: 'データをダウンロードできますか？',
    answer: 'はい、ダウンロードページからTSV形式でツイートデータをダウンロードできます。個人利用・研究目的でご利用ください。'
  },
  {
    question: '無料で使えますか？',
    answer: 'はい、HikamersSearchは完全無料でご利用いただけます。'
  }
]

export default function FaqPage() {
  return (
    <>
      <div className={styles.container}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
          {/* パンくずリスト */}
          <nav aria-label="パンくずリスト" style={{ marginBottom: '20px', fontSize: '14px' }}>
            <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <li><Link href="/" style={{ color: 'var(--link-color)' }}>ホーム</Link></li>
              <li style={{ color: 'var(--text-secondary)' }}>/</li>
              <li style={{ color: 'var(--text-secondary)' }}>よくある質問</li>
            </ol>
          </nav>
          
          <h1 style={{ fontSize: '32px', marginBottom: '30px', color: 'var(--text-primary)' }}>よくある質問（FAQ）</h1>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {faqs.map((faq, index) => (
              <div key={index} style={{ 
                background: 'var(--bg-secondary)', 
                padding: '24px', 
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <h2 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Q. {faq.question}
                </h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  A. {faq.answer}
                </p>
              </div>
            ))}
          </div>
          
          {/* 関連ページ */}
          <nav aria-label="関連ページ" style={{ marginTop: '60px', padding: '24px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>関連ページ</h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <li><Link href="/how-to-use" style={{ color: 'var(--link-color)' }}>使い方ガイド</Link></li>
              <li><Link href="/about" style={{ color: 'var(--link-color)' }}>運営者情報</Link></li>
              <li><Link href="/download" style={{ color: 'var(--link-color)' }}>データダウンロード</Link></li>
            </ul>
          </nav>
        </div>
      </div>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
              }
            }))
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
                name: 'よくある質問',
                item: `${siteUrl}/faq`
              }
            ]
          })
        }}
      />
    </>
  )
}
