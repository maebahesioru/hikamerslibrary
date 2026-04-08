import { NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/site-url'

export async function GET() {
  const baseUrl = getSiteUrl()

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>HikamersSearch</title>
    <link>${baseUrl}</link>
    <description>ツイート検索・ヒカマー界隈のアーカイブ</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/icon-512.png</url>
      <title>HikamersSearch</title>
      <link>${baseUrl}</link>
    </image>
    <webMaster>maebahesioru2@example.com (十字架_mania)</webMaster>
    <managingEditor>maebahesioru2@example.com (十字架_mania)</managingEditor>
    <copyright>© ${new Date().getFullYear()} HikamersSearch</copyright>
    <ttl>60</ttl>
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
