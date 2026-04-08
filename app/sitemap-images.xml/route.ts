import { NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/site-url'

export async function GET() {
  const baseUrl = getSiteUrl()

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'

  xml += `  <url>\n`
  xml += `    <loc>${baseUrl}</loc>\n`
  xml += `    <image:image>\n`
  xml += `      <image:loc>${baseUrl}/logo.png</image:loc>\n`
  xml += `      <image:title>HikamersSearch ロゴ</image:title>\n`
  xml += `      <image:caption>HikamersSearch - ツイート検索エンジン</image:caption>\n`
  xml += `    </image:image>\n`
  xml += `    <image:image>\n`
  xml += `      <image:loc>${baseUrl}/icon-512.png</image:loc>\n`
  xml += `      <image:title>HikamersSearch アイコン</image:title>\n`
  xml += `    </image:image>\n`
  xml += `  </url>\n`

  xml += '</urlset>'

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
