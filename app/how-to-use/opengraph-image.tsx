import { ImageResponse } from 'next/og'
export const dynamic = 'force-dynamic'
export const alt = 'HikamersSearch - 使い方ガイド'
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
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 'bold', color: '#34a853', marginBottom: 20 }}>
          📖 使い方ガイド
        </div>
        <div style={{ fontSize: 40, color: '#e8eaed', marginBottom: 40 }}>
          HikamersSearch チュートリアル
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ padding: '12px 24px', background: '#4285f4', borderRadius: 8, color: '#fff', fontSize: 24 }}>
            検索
          </div>
          <div style={{ padding: '12px 24px', background: '#34a853', borderRadius: 8, color: '#fff', fontSize: 24 }}>
            音声
          </div>
          <div style={{ padding: '12px 24px', background: '#fbbc05', borderRadius: 8, color: '#000', fontSize: 24 }}>
            AI
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
