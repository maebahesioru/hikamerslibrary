export interface HikamerUser {
  userId: string
  userName: string
  userDescription: string
  profileImageUrl: string
  allProfileImages: string[]
  totalLikes: number
  totalRts: number
  totalViews: number
  tweetCount: number
  totalReplies?: number
  totalQuotes?: number
  totalBookmarks?: number
  mediaCount?: number
  maxFollowers?: number
  maxFollowing?: number
  maxTotalTweets?: number
  accountCreatedAt?: string
  mentionCount?: number
  hashtagCount?: number
  urlCount?: number
  replySentCount?: number
  quoteSentCount?: number
  videoCount?: number
  photoCount?: number
  avgLikes?: number
  avgRts?: number
  avgViews?: number
  engagementRate?: number
  viralCoef?: number
  replyRatio?: number
  mediaQuality?: number
  followerGrowth?: number
  originality?: number
  continuity?: number
  contentDiversity?: number
  totalScore?: number
}

export type SortKey = 'total' | 'likes' | 'rts' | 'views' | 'tweets' | 'replies' | 'quotes' | 'bookmarks' | 'media' | 'followers' | 'following' | 'totalTweets' | 'accountAge' | 'mentions' | 'hashtags' | 'urls' | 'replySent' | 'quoteSent' | 'videoCount' | 'photoCount' | 'avgLikes' | 'avgRts' | 'avgViews' | 'engagementRate'

export type ViewMode = 'grid' | 'podium' | 'list'

export const sortCategories: Record<string, SortKey[]> = {
  '📊 基本': ['total', 'likes', 'rts', 'views', 'tweets'],
  '🎯 獲得': ['replies', 'quotes', 'bookmarks'],
  '📤 投稿': ['media', 'videoCount', 'photoCount', 'mentions', 'hashtags', 'urls'],
  '💬 送信': ['replySent', 'quoteSent'],
  '👤 ユーザー': ['followers', 'following', 'totalTweets', 'accountAge'],
  '📈 平均': ['avgLikes', 'avgRts', 'avgViews', 'engagementRate']
}

export const sortLabels: Record<SortKey, string> = {
  total: '🏆 総合スコア',
  likes: '❤️ いいね獲得',
  rts: '🔁 RT獲得',
  views: '👁️ 閲覧数',
  tweets: '📝 ツイート数',
  replies: '💬 リプ獲得',
  quotes: '🔄 引用獲得',
  bookmarks: '🔖 ブクマ獲得',
  media: '📷 メディア投稿',
  followers: '👥 フォロワー数',
  following: '➡️ フォロー数',
  totalTweets: '📊 総ツイート数',
  accountAge: '🕰️ 古参度',
  mentions: '📣 メンション使用',
  hashtags: '#️⃣ ハッシュタグ使用',
  urls: '🔗 URL投稿',
  replySent: '↩️ リプ送信',
  quoteSent: '💬 引用送信',
  videoCount: '🎬 動画投稿',
  photoCount: '🖼️ 写真投稿',
  avgLikes: '📈 平均いいね',
  avgRts: '📈 平均RT',
  avgViews: '📈 平均閲覧',
  engagementRate: '🔥 エンゲージ率'
}

export const viewModeLabels: Record<ViewMode, string> = {
  podium: '🏆 表彰台',
  grid: '📷 グリッド',
  list: '📋 リスト'
}
