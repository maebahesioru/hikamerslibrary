import { NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/site-url'

export async function GET() {
  const baseUrl = getSiteUrl()
  const now = new Date().toISOString()
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  
  // メインサイトマップ
  xml += `  <sitemap>\n`
  xml += `    <loc>${baseUrl}/sitemap.xml</loc>\n`
  xml += `    <lastmod>${now}</lastmod>\n`
  xml += `  </sitemap>\n`
  
  // 画像サイトマップ
  xml += `  <sitemap>\n`
  xml += `    <loc>${baseUrl}/sitemap-images.xml</loc>\n`
  xml += `    <lastmod>${now}</lastmod>\n`
  xml += `  </sitemap>\n`
  
  // 動画サイトマップ
  xml += `  <sitemap>\n`
  xml += `    <loc>${baseUrl}/sitemap-video.xml</loc>\n`
  xml += `    <lastmod>${now}</lastmod>\n`
  xml += `  </sitemap>\n`
  
  // ニュースサイトマップ
  xml += `  <sitemap>\n`
  xml += `    <loc>${baseUrl}/sitemap-news.xml</loc>\n`
  xml += `    <lastmod>${now}</lastmod>\n`
  xml += `  </sitemap>\n`
  
  xml += '</sitemapindex>'
  
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
