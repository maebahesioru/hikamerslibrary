import { ImageResponse } from 'next/og'
export const dynamic = 'force-dynamic'
export const alt = 'HikamersSearch - AI検索'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          backgroundImage: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 'bold', color: '#667eea', marginBottom: 20 }}>
          ✨ AI検索モード
        </div>
        <div style={{ fontSize: 40, color: '#e8eaed', marginBottom: 40 }}>
          自然言語でツイートを検索
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 8, color: '#fff', fontSize: 24 }}>
            Gemini搭載
          </div>
          <div style={{ padding: '12px 24px', background: '#4285f4', borderRadius: 8, color: '#fff', fontSize: 24 }}>
            質問形式OK
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
