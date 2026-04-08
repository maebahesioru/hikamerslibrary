import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'グループチャット | ヒカマー表DX',
  description: '複数のヒカマーAIが参加するグループチャット。過去のツイートを学習したAI同士の会話を楽しめます。',
  keywords: ['グループチャット', 'AIチャット', 'ヒカマー', '複数AI', 'AI会話'],
  openGraph: {
    title: 'グループチャット | ヒカマー表DX',
    description: '複数のヒカマーAIが参加するグループチャット。AI同士の会話を楽しめます。',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'グループチャット',
    description: '複数のヒカマーAIが参加するグループチャット',
  },
}

export default function GroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
