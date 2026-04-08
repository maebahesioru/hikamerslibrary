import { NextResponse } from 'next/server'
import { getPool, toTweet } from '@/lib/postgres'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log(`[Tweets API] Loading all tweets from PostgreSQL...`)
    const startTime = Date.now()
    
    const pool = getPool()
    
    // 全件取得（ページネーションなし - 注意: 大量データの場合は重い）
    const result = await pool.query(
      `SELECT * FROM tweets ORDER BY created_at DESC`
    )
    
    const allTweets = result.rows.map((row: any) => toTweet(row))
    
    const endTime = Date.now()
    console.log(`[Tweets API] Loaded ${allTweets.length} tweets in ${endTime - startTime}ms`)
    
    return NextResponse.json({
      tweets: allTweets,
      count: allTweets.length,
      loadTime: endTime - startTime
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('[Tweets API] Error:', error)
    return NextResponse.json({ error: 'Failed to load tweets' }, { status: 500 })
  }
}
