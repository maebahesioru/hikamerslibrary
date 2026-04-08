import { ImageResponse } from 'next/og'
export const dynamic = 'force-dynamic'
export const alt = 'HikamersSearch - データダウンロード'
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
          📥 データダウンロード
        </div>
        <div style={{ fontSize: 40, color: '#e8eaed', marginBottom: 40 }}>
          ツイートデータセット
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ padding: '12px 24px', background: '#34a853', borderRadius: 8, color: '#fff', fontSize: 24 }}>
            30万件+
          </div>
          <div style={{ padding: '12px 24px', background: '#4285f4', borderRadius: 8, color: '#fff', fontSize: 24 }}>
            TSV形式
          </div>
          <div style={{ padding: '12px 24px', background: '#fbbc05', borderRadius: 8, color: '#000', fontSize: 24 }}>
            無料
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
