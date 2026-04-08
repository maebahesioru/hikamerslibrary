import { ImageResponse } from 'next/og'
export const dynamic = 'force-dynamic'
export const alt = 'ヒカマー表DX - ランキング＆なりきりAI'
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
        <div style={{ fontSize: 80, fontWeight: 'bold', color: '#fbbc05', marginBottom: 20 }}>
          🏆 ヒカマー表DX
        </div>
        <div style={{ fontSize: 40, color: '#e8eaed', marginBottom: 40 }}>
          ヒカマーランキング＆なりきりAI
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ padding: '12px 24px', background: '#fbbc05', borderRadius: 8, color: '#000', fontSize: 24 }}>
            ランキング
          </div>
          <div style={{ padding: '12px 24px', background: '#34a853', borderRadius: 8, color: '#fff', fontSize: 24 }}>
            AIチャット
          </div>
          <div style={{ padding: '12px 24px', background: '#ea4335', borderRadius: 8, color: '#fff', fontSize: 24 }}>
            バトル
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
