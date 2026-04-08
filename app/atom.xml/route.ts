import { NextResponse } from 'next/server'
import { getSiteUrl } from '@/lib/site-url'

export async function GET() {
  const baseUrl = getSiteUrl()
  const updated = new Date().toISOString()

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ja">
  <title>HikamersSearch</title>
  <subtitle>ツイート検索・ヒカマー界隈のアーカイブ</subtitle>
  <link href="${baseUrl}" rel="alternate" type="text/html"/>
  <link href="${baseUrl}/atom.xml" rel="self" type="application/atom+xml"/>
  <id>${baseUrl}/</id>
  <updated>${updated}</updated>
  <author>
    <name>十字架_mania</name>
    <uri>https://x.com/maebahesioru2</uri>
  </author>
  <icon>${baseUrl}/icon-192.png</icon>
  <logo>${baseUrl}/icon-512.png</logo>
  <rights>© ${new Date().getFullYear()} HikamersSearch</rights>
  <generator uri="https://nextjs.org/">Next.js</generator>
</feed>`

  return new NextResponse(atom, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
