import { ImageResponse } from 'next/og'

export const dynamic = 'force-dynamic'
export const alt = 'HikamersSearch - ツイート検索エンジン'
export const size = {
  width: 1200,
  height: 600,
}
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
          backgroundColor: '#000',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
          }}
        >
          <div
            style={{
              fontSize: 100,
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #4285f4 0%, #34a853 50%, #fbbc05 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 30,
              letterSpacing: '-0.02em',
            }}
          >
            HikamersSearch
          </div>
          <div
            style={{
              fontSize: 40,
              color: '#e8eaed',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            高速で正確なツイート検索エンジン
          </div>
          <div
            style={{
              display: 'flex',
              gap: 24,
              marginTop: 50,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 24px',
                backgroundColor: 'rgba(66, 133, 244, 0.1)',
                borderRadius: 10,
                border: '2px solid #4285f4',
              }}
            >
              <span style={{ color: '#4285f4', fontSize: 28, fontWeight: 600 }}>🔍 検索</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 24px',
                backgroundColor: 'rgba(52, 168, 83, 0.1)',
                borderRadius: 10,
                border: '2px solid #34a853',
              }}
            >
              <span style={{ color: '#34a853', fontSize: 28, fontWeight: 600 }}>🎤 音声</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 24px',
                backgroundColor: 'rgba(251, 188, 5, 0.1)',
                borderRadius: 10,
                border: '2px solid #fbbc05',
              }}
            >
              <span style={{ color: '#fbbc05', fontSize: 28, fontWeight: 600 }}>✨ AI</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
