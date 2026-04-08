import { ImageResponse } from 'next/og'

export const dynamic = 'force-dynamic'
export const alt = 'ツイート検索 | HikamersSearch'
export const size = {
  width: 1200,
  height: 600,
}
export const contentType = 'image/png'

interface Props {
  params: Promise<{}>
  searchParams: Promise<{ q?: string }>
}

export default async function Image({ searchParams }: Props) {
  const params = searchParams != null ? await searchParams : {}
  const query = params.q || ''
  
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
        <div style={{ fontSize: 48, color: '#4285f4', marginBottom: 20 }}>
          HikamersSearch
        </div>
        {query ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 56, color: '#e8eaed', marginBottom: 20 }}>
              🔍 「{query.length > 20 ? query.substring(0, 20) + '...' : query}」
            </div>
            <div style={{ fontSize: 32, color: '#9aa0a6' }}>の検索結果</div>
          </div>
        ) : (
          <div style={{ fontSize: 64, color: '#e8eaed' }}>🔍 ツイート検索</div>
        )}
      </div>
    ),
    { ...size }
  )
}
