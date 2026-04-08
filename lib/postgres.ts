import { Pool } from 'pg'

// PostgreSQL接続プール
let pool: Pool | null = null

function resolveConnectionString(): string {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL must be set')
  }
  return connectionString
}

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
  
  // 既にhttpsで始まる場合はそのまま
  if (url.startsWith('https://')) return url
  if (url.startsWith('http://')) return url.replace('http://', 'https://')
  
  return url
}

export function getPool(): Pool {
  if (!pool) {
    const connectionString = resolveConnectionString()

    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: false // Cloud SQLはパブリックIP接続でSSL不要（必要なら設定）
    })
    
    pool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err)
    })
  }
  
  return pool
}

// クエリ実行ヘルパー
export async function query(sql: string, args: any[] = []): Promise<any[]> {
  const pool = getPool()
  const result = await pool.query(sql, args)
  return result.rows
}

// 単一行取得
export async function queryOne(sql: string, args: any[] = []): Promise<any | null> {
  const rows = await query(sql, args)
  return rows[0] || null
}

// DBカラム名からフロントエンド用に変換
export function toTweet(row: any) {
  return {
    id: row.id,
    createdAt: row.created_at,
    displayText: (row.display_text || '').replace(/\\n/g, '\n'),
    lang: row.lang || '',
    source: row.source || '',
    replyCount: String(row.reply_count || 0),
    rtCount: String(row.rt_count || 0),
    qtCount: String(row.qt_count || 0),
    likesCount: String(row.likes_count || 0),
    viewCount: row.view_count ? String(row.view_count) : '',
    bookmarkCount: row.bookmark_count ? String(row.bookmark_count) : '',
    mediaType: row.media_type || '',
    media: row.media || '',
    urls: row.urls || '',
    hashtags: row.hashtags || '',
    mentions: row.mentions || '',
    inReplyToUserId: row.in_reply_to_user_id || '',
    inReplyToScreenName: row.in_reply_to_screen_name || '',
    inReplyToTweetId: row.in_reply_to_tweet_id || '',
    quotedTweetId: row.quoted_tweet_id || '',
    quotedTweetText: row.quoted_tweet_text || '',
    userId: row.user_id,
    userName: row.user_name,
    userRestId: row.user_rest_id || '',
    userDescription: row.user_description || '',
    userFollowersCount: row.user_followers_count ? String(row.user_followers_count) : '',
    userFollowingCount: row.user_following_count ? String(row.user_following_count) : '',
    userTweetCount: row.user_tweet_count ? String(row.user_tweet_count) : '',
    userCreatedAt: row.user_created_at || '',
    userProfileImageUrl: convertProfileImageUrl(row.user_profile_image_url || ''),
    userProfileBannerUrl: row.user_profile_banner_url || '',
    userVerified: row.user_verified || '',
    userLocation: row.user_location || '',
    // 後方互換性エイリアス
    name: row.user_name,
    profileImage: convertProfileImageUrl(row.user_profile_image_url || ''),
  }
}
