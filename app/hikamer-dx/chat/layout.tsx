import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'なりきりAIチャット | ヒカマー表DX',
  description: 'ヒカマーになりきったAIとチャット。過去のツイートを学習したAIが、そのユーザーらしい返答をします。',
  keywords: ['なりきりAI', 'AIチャット', 'ヒカマー', 'キャラクターAI', 'チャットボット'],
  openGraph: {
    title: 'なりきりAIチャット | ヒカマー表DX',
    description: 'ヒカマーになりきったAIとチャット。過去のツイートを学習したAIが、そのユーザーらしい返答をします。',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'なりきりAIチャット',
    description: 'ヒカマーになりきったAIとチャット',
  },
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
