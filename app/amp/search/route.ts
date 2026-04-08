import { NextRequest, NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/site-url'

export async function GET(request: NextRequest) {
  const siteUrl = getSiteUrl()
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''
  
  const title = query ? `「${query}」の検索結果 | HikamersSearch` : 'ツイート検索 | HikamersSearch'
  const description = query 
    ? `「${query}」に関するツイートの検索結果。HikamersSearchで高速検索。`
    : 'HikamersSearchでツイートを検索。'
  const canonicalUrl = `${siteUrl}/search${query ? `?q=${encodeURIComponent(query)}` : ''}`

  const html = `<!doctype html>
<html ⚡ lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonicalUrl}">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <style amp-custom>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #202124;
      color: #e8eaed;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(90deg, #4285f4, #34a853, #fbbc05);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .search-box {
      max-width: 600px;
      margin: 0 auto 30px;
    }
    .search-input {
      width: 100%;
      padding: 15px 20px;
      border: 1px solid #5f6368;
      border-radius: 24px;
      background: #303134;
      color: #e8eaed;
      font-size: 16px;
      outline: none;
      box-sizing: border-box;
    }
    .message {
      text-align: center;
      color: #9aa0a6;
      margin-top: 40px;
    }
    .full-link {
      display: block;
      text-align: center;
      margin-top: 20px;
      color: #8ab4f8;
      text-decoration: none;
    }
    .full-link:hover {
      text-decoration: underline;
    }
    .features {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 30px;
      flex-wrap: wrap;
    }
    .feature {
      padding: 10px 20px;
      background: #303134;
      border-radius: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">HikamersSearch</div>
    <p>高速ツイート検索エンジン</p>
  </div>
  
  <div class="search-box">
    <form action="/search" method="get" target="_top">
      <input 
        type="search" 
        name="q" 
        class="search-input"
        placeholder="ツイートを検索"
        value="${query.replace(/"/g, '&quot;')}"
      >
    </form>
  </div>
  
  ${query ? `
  <div class="message">
    <p>「${query}」の検索結果を表示するには、フル版をご利用ください。</p>
    <a href="${canonicalUrl}" class="full-link">
      フル版で検索結果を見る →
    </a>
  </div>
  ` : `
  <div class="message">
    <p>検索キーワードを入力してください</p>
  </div>
  `}
  
  <div class="features">
    <span class="feature">🔍 高速検索</span>
    <span class="feature">🎤 音声検索</span>
    <span class="feature">✨ AI検索</span>
  </div>
  
  <a href="${siteUrl}" class="full-link">
    HikamersSearch フル版へ
  </a>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'AMP-Access-Control-Allow-Source-Origin': siteUrl,
    },
  })
}
