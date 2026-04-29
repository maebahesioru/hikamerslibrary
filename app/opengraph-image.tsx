import { ImageResponse } from 'next/og'

export const alt = 'HikamersSearch - ツイート検索エンジン'
export const size = {
  width: 1200,
  height: 630,
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
            padding: '80px',
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #4285f4 0%, #34a853 50%, #fbbc05 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 40,
              letterSpacing: '-0.02em',
            }}
          >
            HikamersSearch
          </div>
          <div
            style={{
              fontSize: 48,
              color: '#e8eaed',
              textAlign: 'center',
              maxWidth: '900px',
              lineHeight: 1.4,
            }}
          >
            高速で正確なツイート検索エンジン
          </div>
          <div
            style={{
              display: 'flex',
              gap: 30,
              marginTop: 60,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 32px',
                backgroundColor: 'rgba(66, 133, 244, 0.1)',
                borderRadius: 12,
                border: '2px solid #4285f4',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#4285f4">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#4285f4" strokeWidth="2" fill="none" />
              </svg>
              <span style={{ color: '#4285f4', fontSize: 32, fontWeight: 600 }}>検索</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 32px',
                backgroundColor: 'rgba(52, 168, 83, 0.1)',
                borderRadius: 12,
                border: '2px solid #34a853',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34a853" strokeWidth="2">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
              <span style={{ color: '#34a853', fontSize: 32, fontWeight: 600 }}>音声</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 32px',
                backgroundColor: 'rgba(251, 188, 5, 0.1)',
                borderRadius: 12,
                border: '2px solid #fbbc05',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbc05" strokeWidth="2">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
              </svg>
              <span style={{ color: '#fbbc05', fontSize: 32, fontWeight: 600 }}>AI</span>
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
