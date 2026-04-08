import { NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/site-url'

export async function GET() {
  const baseUrl = getSiteUrl()
  
  // 動画サイトマップ（動画検索最適化用）
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n'
  
  // 動画検索ページ
  xml += `  <url>\n`
  xml += `    <loc>${baseUrl}/search?tbm=vid</loc>\n`
  xml += `    <video:video>\n`
  xml += `      <video:thumbnail_loc>${baseUrl}/icon-512.png</video:thumbnail_loc>\n`
  xml += `      <video:title>ヒカマー界隈の動画ツイート検索</video:title>\n`
  xml += `      <video:description>ヒカマー界隈で投稿された動画付きツイートを検索できます。</video:description>\n`
  xml += `      <video:family_friendly>yes</video:family_friendly>\n`
  xml += `      <video:live>no</video:live>\n`
  xml += `    </video:video>\n`
  xml += `  </url>\n`
  
  xml += '</urlset>'
  
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
