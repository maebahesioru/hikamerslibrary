import { ImageResponse } from 'next/og'
export const dynamic = 'force-dynamic'
export const alt = 'HikamersSearch - 運営者情報'
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
        <div style={{ fontSize: 80, fontWeight: 'bold', color: '#4285f4', marginBottom: 20 }}>
          👤 運営者情報
        </div>
        <div style={{ fontSize: 40, color: '#e8eaed', marginBottom: 40 }}>
          十字架_mania
        </div>
        <div style={{ fontSize: 28, color: '#9aa0a6' }}>
          @maebahesioru2
        </div>
      </div>
    ),
    { ...size }
  )
}
