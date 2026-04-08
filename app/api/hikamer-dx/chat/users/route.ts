import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// キャッシュ
let cachedUsers: any[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 1000 * 60 * 60 // 1時間

// /pic/形式のURLを実際のTwitter画像URLに変換
function convertProfileImageUrl(url: string): string {
  if (!url) return ''
  
  // /pic/profile_images%2F... → https://pbs.twimg.com/profile_images/...
  if (url.startsWith('/pic/profile_images')) {
    const decoded = decodeURIComponent(url.replace('/pic/', ''))
    // _bigger.jpg などのサフィックスを _400x400.jpg に変換（高解像度）
    const highRes = decoded.replace(/_bigger\.(jpg|png|webp)$/i, '_400x400.$1')
      .replace(/_normal\.(jpg|png|webp)$/i, '_400x400.$1')
    return `https://pbs.twimg.com/${highRes}`
  }
  
  // 既にhttpsで始まる場合はそのまま（_bigger/_normalを_400x400に）
  if (url.startsWith('https://')) {
    return url.replace(/_bigger\.(jpg|png|webp)$/i, '_400x400.$1')
      .replace(/_normal\.(jpg|png|webp)$/i, '_400x400.$1')
  }
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://')
      .replace(/_bigger\.(jpg|png|webp)$/i, '_400x400.$1')
      .replace(/_normal\.(jpg|png|webp)$/i, '_400x400.$1')
  }
  
  return url
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || ''
  
  try {
    // 検索なしでキャッシュがあればそれを返す
    if (!query.trim() && cachedUsers && Date.now() - cacheTimestamp < CACHE_TTL) {
      return NextResponse.json({ users: cachedUsers }, {
        headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600' }
      })
    }
    
    const client = await pool.connect()
    
    let result
    if (query.trim()) {
      // 検索あり - キャッシュから検索
      if (cachedUsers && Date.now() - cacheTimestamp < CACHE_TTL) {
        client.release()
        const q = query.toLowerCase()
        const filtered = cachedUsers.filter(u => 
          u.userId.toLowerCase().includes(q) || 
          u.userName.toLowerCase().includes(q)
        )
        return NextResponse.json({ users: filtered })
      }
      
      // キャッシュなければDB検索
      result = await client.query(`
        SELECT 
          user_id,
          COALESCE(MAX(NULLIF(user_name, '')), user_id) as user_name,
          COALESCE(MAX(NULLIF(user_profile_image_url, '')), '') as profile_image_url,
          array_agg(DISTINCT user_profile_image_url) FILTER (WHERE user_profile_image_url IS NOT NULL AND user_profile_image_url != '') as all_profile_images,
          COUNT(*) as tweet_count
        FROM tweets
        WHERE user_id ILIKE $1 OR user_name ILIKE $1
        GROUP BY user_id
        HAVING COUNT(*) >= 1
        ORDER BY COUNT(*) DESC
      `, [`%${query}%`])
    } else {
      // 検索なし - 全員取得してキャッシュ
      result = await client.query(`
        SELECT 
          user_id,
          COALESCE(MAX(NULLIF(user_name, '')), user_id) as user_name,
          COALESCE(MAX(NULLIF(user_profile_image_url, '')), '') as profile_image_url,
          array_agg(DISTINCT user_profile_image_url) FILTER (WHERE user_profile_image_url IS NOT NULL AND user_profile_image_url != '') as all_profile_images,
          COUNT(*) as tweet_count
        FROM tweets
        GROUP BY user_id
        HAVING COUNT(*) >= 10
        ORDER BY COUNT(*) DESC
      `)
    }
    
    client.release()
    
    const users = result.rows.map(row => {
      const allImages = (row.all_profile_images || []) as string[]
      const convertedImages = allImages.map(convertProfileImageUrl).filter(Boolean)
      const sortedImages = [...convertedImages].sort((a, b) => {
        const aScore = a.startsWith('https://pbs.twimg.com') ? 0 : 1
        const bScore = b.startsWith('https://pbs.twimg.com') ? 0 : 1
        return aScore - bScore
      })
      const profileImageUrl = sortedImages[0] || convertProfileImageUrl(row.profile_image_url) || '/default-avatar.png'
      
      return {
        userId: row.user_id,
        userName: row.user_name || row.user_id,
        profileImageUrl,
        allProfileImages: sortedImages,
        tweetCount: parseInt(row.tweet_count)
      }
    })
    
    // 検索なしの場合はキャッシュ
    if (!query.trim()) {
      cachedUsers = users
      cacheTimestamp = Date.now()
    }
    
    return NextResponse.json({ users }, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600' }
    })
  } catch (error: any) {
    console.error('Users API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
