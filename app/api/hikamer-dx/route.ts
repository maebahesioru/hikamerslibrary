import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/postgres'

export const dynamic = 'force-dynamic'

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60000 // 1分キャッシュ

function getCached(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data
  return null
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

// /pic/形式のURLを実際のTwitter画像URLに変換
function convertProfileImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('/pic/profile_images')) {
    const decoded = decodeURIComponent(url.replace('/pic/', ''))
    const highRes = decoded.replace(/_bigger\.(jpg|png|webp)$/i, '_400x400.$1')
      .replace(/_normal\.(jpg|png|webp)$/i, '_400x400.$1')
    return `https://pbs.twimg.com/${highRes}`
  }
  if (url.startsWith('https://')) return url
  if (url.startsWith('http://')) return url.replace('http://', 'https://')
  return url
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'years') {
    const cacheKey = 'years'
    const cached = getCached(cacheKey)
    if (cached) return NextResponse.json(cached)
    try {
      const client = getPool()
      const result = await client.query(`SELECT DISTINCT SUBSTRING(first_tweet_at FROM 1 FOR 4) as year FROM user_stats WHERE first_tweet_at IS NOT NULL ORDER BY year DESC`)
      const years = result.rows.map(r => r.year).filter(y => y && /^\d{4}$/.test(y))
      const data = { years }
      setCache(cacheKey, data)
      return NextResponse.json(data)
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // ランダムユーザー取得（Discord Bot用）
  if (action === 'random') {
    try {
      const client = getPool()
      const result = await client.query(`SELECT user_id, user_name, profile_image_url FROM user_stats ORDER BY RANDOM() LIMIT 1`)
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'No users found' }, { status: 404 })
      }
      const row = result.rows[0]
      return NextResponse.json({
        userId: row.user_id,
        userName: row.user_name,
        profileImageUrl: convertProfileImageUrl(row.profile_image_url) || ''
      })
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // ユーザー検索（Discord Bot用）
  if (action === 'search') {
    const query = searchParams.get('q')
    if (!query) {
      return NextResponse.json({ error: 'q parameter required' }, { status: 400 })
    }
    try {
      const client = getPool()
      const searchPattern = `%${query}%`
      const result = await client.query(`
        SELECT user_id, user_name, profile_image_url 
        FROM user_stats 
        WHERE LOWER(user_id) LIKE LOWER($1) OR LOWER(user_name) LIKE LOWER($1)
        ORDER BY 
          CASE WHEN LOWER(user_id) = LOWER($2) THEN 0
               WHEN LOWER(user_name) = LOWER($2) THEN 1
               WHEN LOWER(user_id) LIKE LOWER($3) THEN 2
               ELSE 3 END,
          total_likes DESC
        LIMIT 10
      `, [searchPattern, query, query + '%'])
      
      const users = result.rows.map(row => ({
        userId: row.user_id,
        userName: row.user_name,
        profileImageUrl: convertProfileImageUrl(row.profile_image_url) || ''
      }))
      return NextResponse.json({ users })
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  const sortBy = searchParams.get('sortBy') || 'likes'
  const limit = parseInt(searchParams.get('limit') || '100')

  const cacheKey = `hikamer-${sortBy}-${limit}`
  const cachedData = getCached(cacheKey)
  if (cachedData) return NextResponse.json(cachedData, {
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' }
  })

  try {
    const client = getPool()
    const sortColumn: Record<string, string> = {
      total: 'total_score', likes: 'total_likes', rts: 'total_rts', views: 'total_views', tweets: 'tweet_count',
      replies: 'total_replies', quotes: 'total_quotes', bookmarks: 'total_bookmarks', media: 'media_count',
      followers: 'max_followers', following: 'max_following', totalTweets: 'max_total_tweets',
      accountAge: 'min_created_at', mentions: 'mention_count', hashtags: 'hashtag_count', urls: 'url_count',
      replySent: 'reply_sent_count', quoteSent: 'quote_sent_count', videoCount: 'video_count', photoCount: 'photo_count',
      avgLikes: 'avg_likes', avgRts: 'avg_rts', avgViews: 'avg_views', engagementRate: 'engagement_rate'
    }
    const orderBy = sortColumn[sortBy] || 'total_likes'
    const orderDirection = sortBy === 'accountAge' ? 'ASC' : 'DESC'

    // user_statsテーブルから直接取得（高速）
    const sql = `SELECT * FROM user_stats ORDER BY ${orderBy} ${orderDirection} NULLS LAST LIMIT $1`
    const result = await client.query(sql, [limit])

    const users = result.rows.map(row => {
      const profileImageUrl = convertProfileImageUrl(row.profile_image_url) || ''
      
      return {
        userId: row.user_id,
        userName: row.user_name,
        userDescription: row.user_description || '',
        profileImageUrl,
        totalLikes: parseInt(row.total_likes) || 0,
        totalRts: parseInt(row.total_rts) || 0,
        totalViews: parseInt(row.total_views) || 0,
        totalReplies: parseInt(row.total_replies) || 0,
        totalQuotes: parseInt(row.total_quotes) || 0,
        totalBookmarks: parseInt(row.total_bookmarks) || 0,
        mediaCount: parseInt(row.media_count) || 0,
        tweetCount: parseInt(row.tweet_count) || 0,
        maxFollowers: parseInt(row.max_followers) || 0,
        maxFollowing: parseInt(row.max_following) || 0,
        maxTotalTweets: parseInt(row.max_total_tweets) || 0,
        accountCreatedAt: row.min_created_at || '',
        mentionCount: parseInt(row.mention_count) || 0,
        hashtagCount: parseInt(row.hashtag_count) || 0,
        urlCount: parseInt(row.url_count) || 0,
        replySentCount: parseInt(row.reply_sent_count) || 0,
        quoteSentCount: parseInt(row.quote_sent_count) || 0,
        videoCount: parseInt(row.video_count) || 0,
        photoCount: parseInt(row.photo_count) || 0,
        avgLikes: parseFloat(row.avg_likes) || 0,
        avgRts: parseFloat(row.avg_rts) || 0,
        avgViews: parseFloat(row.avg_views) || 0,
        engagementRate: parseFloat(row.engagement_rate) || 0,
        viralCoef: parseFloat(row.viral_coef) || 0,
        replyRatio: parseFloat(row.reply_ratio) || 0,
        mediaQuality: parseFloat(row.media_quality) || 0,
        followerGrowth: parseFloat(row.follower_growth) || 0,
        originality: parseFloat(row.originality) || 0,
        continuity: parseInt(row.continuity) || 0,
        contentDiversity: parseInt(row.content_diversity) || 0,
        totalScore: parseFloat(row.total_score) || 0
      }
    })

    const responseData = { users }
    setCache(cacheKey, responseData)
    return NextResponse.json(responseData, {
      headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' }
    })
  } catch (error: any) {
    console.error('[Hikamer DX] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
