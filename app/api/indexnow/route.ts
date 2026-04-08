import { NextRequest, NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/site-url'

const INDEXNOW_KEY = 'hikamers-indexnow-key-2024'

function siteOrigin(): { url: string; host: string } {
  const url = getSiteUrl()
  return { url, host: new URL(url).host }
}

// IndexNow APIエンドポイント
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
]

export async function POST(request: NextRequest) {
  const { url: SITE_URL, host: SITE_HOST } = siteOrigin()
  try {
    const { urls } = await request.json()
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLs required' }, { status: 400 })
    }

    // 最大10,000 URLまで
    const urlList = urls.slice(0, 10000).map((url: string) => 
      url.startsWith('http') ? url : `${SITE_URL}${url}`
    )

    const payload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList
    }

    // 全エンドポイントに送信
    const results = await Promise.allSettled(
      INDEXNOW_ENDPOINTS.map(endpoint =>
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      )
    )

    const success = results.filter(r => r.status === 'fulfilled').length

    return NextResponse.json({
      success: true,
      submitted: urlList.length,
      endpoints: success
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// 主要ページを自動送信するGET
export async function GET() {
  const { url: SITE_URL, host: SITE_HOST } = siteOrigin()
  const mainPages = [
    '/',
    '/search',
    '/ai',
    '/hikamer-dx',
    '/faq',
    '/about',
    '/how-to-use',
    '/download'
  ]

  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: mainPages.map(p => `${SITE_URL}${p}`)
  }

  try {
    await fetch(INDEXNOW_ENDPOINTS[0], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    return NextResponse.json({ success: true, pages: mainPages.length })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
