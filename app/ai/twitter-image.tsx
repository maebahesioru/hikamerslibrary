import { ImageResponse } from 'next/og'

export const dynamic = 'force-dynamic'
export const alt = 'AI検索モード | HikamersSearch'
export const size = { width: 1200, height: 600 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a', backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #2d1a4a 100%)' }}>
        <div style={{ fontSize: 48, color: '#4285f4', marginBottom: 20 }}>HikamersSearch</div>
        <div style={{ fontSize: 72, color: '#e8eaed', marginBottom: 20, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '16px 32px', borderRadius: 16 }}>✨ AI検索</div>
        <div style={{ fontSize: 32, color: '#9aa0a6' }}>自然言語でツイートを検索</div>
      </div>
    ),
    { ...size }
  )
}
