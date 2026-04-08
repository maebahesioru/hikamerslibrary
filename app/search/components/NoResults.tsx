import Link from 'next/link'
import FishingGame from './FishingGame'

interface NoResultsProps {
  searchQuery?: string
}

export function NoResults({ searchQuery }: NoResultsProps) {
  return (
    <div>
      <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-primary)' }}>
        検索結果が見つかりませんでした
      </h2>
      <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
        「{searchQuery}」に一致する結果はありませんでした。
      </p>
      
      <SearchTips />
      <AlternativeSuggestions />
      <FishingGame />
    </div>
  )
}

function SearchTips() {
  return (
    <div style={{ 
      background: 'var(--bg-secondary)', 
      padding: '20px', 
      borderRadius: '12px',
      marginBottom: '24px',
      textAlign: 'left'
    }}>
      <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary)' }}>
        検索のヒント
      </h3>
      <ul style={{ 
        color: 'var(--text-secondary)', 
        lineHeight: 1.8, 
        paddingLeft: '20px',
        margin: 0
      }}>
        <li>キーワードの綴りを確認してください</li>
        <li>別のキーワードを試してください</li>
        <li>より一般的なキーワードを使用してください</li>
        <li>ユーザー名で検索する場合は@を除いてください</li>
      </ul>
    </div>
  )
}

function AlternativeSuggestions() {
  const suggestions = [
    { href: '/ai', label: '✨ AI検索で質問する', primary: true },
    { href: '/hikamer-dx', label: '🏆 ヒカマー表を見る', primary: false },
  ]
  
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-primary)' }}>
        こちらもお試しください
      </h3>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {suggestions.map(({ href, label, primary }) => (
          <Link
            key={href}
            href={href}
            style={{ 
              padding: '10px 20px', 
              background: primary ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'var(--bg-secondary)',
              color: primary ? '#fff' : 'var(--text-primary)',
              borderRadius: '20px',
              textDecoration: 'none',
              fontSize: '14px',
              border: primary ? 'none' : '1px solid var(--border-color)'
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
