import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'なりきりAI創作 | ヒカマー表DX',
  description: 'ヒカマー同士のAIバトル、漫才、コント、ラップバトル、ディベート、ドラマを生成。過去のツイートを学習したAIが創作します。',
  keywords: ['AIバトル', 'AI漫才', 'AIコント', 'ラップバトル', 'ヒカマー', 'AI創作'],
  openGraph: {
    title: 'なりきりAI創作 | ヒカマー表DX',
    description: 'ヒカマー同士のAIバトル、漫才、コント、ラップバトル、ディベート、ドラマを生成。',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'なりきりAI創作',
    description: 'ヒカマー同士のAIバトル、漫才、コント、ラップバトルを生成',
  },
}

export default function BattleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
