import { createClient, Client } from '@libsql/client'

// Tursoクライアント（サーバーレス環境対応 - 毎回新規作成）
export function getTursoClient(): Client {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  
  if (!url) {
    throw new Error('TURSO_DATABASE_URL must be set')
  }
  
  if (!authToken) {
    throw new Error('TURSO_AUTH_TOKEN must be set')
  }
  
  // サーバーレス環境では毎回新しいクライアントを作成
  return createClient({ url, authToken })
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

// DBカラム名からフロントエンド用に変換
export function toTweet(row: any) {
  return {
    id: row.id,
    createdAt: row.created_at,
    displayText: row.display_text,
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
    userProfileImageUrl: row.user_profile_image_url || '',
    userProfileBannerUrl: row.user_profile_banner_url || '',
    userVerified: row.user_verified || '',
    userLocation: row.user_location || '',
    // 後方互換性エイリアス
    name: row.user_name,
    profileImage: row.user_profile_image_url || '',
  }
}
