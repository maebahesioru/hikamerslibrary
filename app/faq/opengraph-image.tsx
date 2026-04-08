import { ImageResponse } from 'next/og'
export const dynamic = 'force-dynamic'
export const alt = 'HikamersSearch - よくある質問（FAQ）'
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
        <div style={{ fontSize: 80, fontWeight: 'bold', color: '#ea4335', marginBottom: 20 }}>
          ❓ よくある質問
        </div>
        <div style={{ fontSize: 40, color: '#e8eaed', marginBottom: 40 }}>
          HikamersSearch FAQ
        </div>
        <div style={{ fontSize: 28, color: '#9aa0a6' }}>
          15の質問と回答
        </div>
      </div>
    ),
    { ...size }
  )
}
