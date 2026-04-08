import { ImageResponse } from 'next/og'
export const dynamic = 'force-dynamic'
export const alt = 'ヒカマー表DX | HikamersSearch'
export const size = { width: 1200, height: 600 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a' }}>
        <div style={{ fontSize: 48, color: '#4285f4', marginBottom: 20 }}>HikamersSearch</div>
        <div style={{ fontSize: 72, color: '#e8eaed', marginBottom: 20 }}>🏆 ヒカマー表DX</div>
        <div style={{ fontSize: 32, color: '#9aa0a6' }}>ヒカマー界隈の活躍度ランキング</div>
      </div>
    ),
    { ...size }
  )
}
