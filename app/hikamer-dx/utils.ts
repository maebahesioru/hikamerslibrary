import { HikamerUser, SortKey } from './types'

export function getSortValue(user: HikamerUser, key: SortKey): number | string {
  switch (key) {
    case 'total': return user.totalScore || 0
    case 'likes': return user.totalLikes
    case 'rts': return user.totalRts
    case 'views': return user.totalViews
    case 'tweets': return user.tweetCount
    case 'replies': return user.totalReplies || 0
    case 'quotes': return user.totalQuotes || 0
    case 'bookmarks': return user.totalBookmarks || 0
    case 'media': return user.mediaCount || 0
    case 'followers': return user.maxFollowers || 0
    case 'following': return user.maxFollowing || 0
    case 'totalTweets': return user.maxTotalTweets || 0
    case 'accountAge': return user.accountCreatedAt || ''
    case 'mentions': return user.mentionCount || 0
    case 'hashtags': return user.hashtagCount || 0
    case 'urls': return user.urlCount || 0
    case 'replySent': return user.replySentCount || 0
    case 'quoteSent': return user.quoteSentCount || 0
    case 'videoCount': return user.videoCount || 0
    case 'photoCount': return user.photoCount || 0
    case 'avgLikes': return user.avgLikes || 0
    case 'avgRts': return user.avgRts || 0
    case 'avgViews': return user.avgViews || 0
    case 'engagementRate': return user.engagementRate || 0
    default: return 0
  }
}

export function getValue(user: HikamerUser, sortBy: SortKey): number | string {
  const val = getSortValue(user, sortBy)
  if (sortBy === 'total') return Math.round(val as number)
  return val
}

export function filterHikamers(users: HikamerUser[]): HikamerUser[] {
  const hikamerPatterns = ['mania', 'マニア', 'マニ', 'まにあ', 'まに', 'キン', 'kin', 'tv', 'マー']
  const excludeIds = ['hikakin', 'seikintv', 'masuotv', 'dekakinb']
  
  return users.filter(u => {
    const id = u.userId.toLowerCase()
    const name = u.userName.toLowerCase()
    const desc = (u.userDescription || '').toLowerCase()
    if (excludeIds.includes(id)) return false
    return hikamerPatterns.some(p => id.includes(p) || name.includes(p) || desc.includes(p))
  })
}

export function filterBySearch(users: HikamerUser[], query: string): HikamerUser[] {
  if (!query.trim()) return users
  const q = query.toLowerCase()
  return users.filter(u => 
    u.userId.toLowerCase().includes(q) || 
    u.userName.toLowerCase().includes(q)
  )
}

export function sortUsers(users: HikamerUser[], sortBy: SortKey): HikamerUser[] {
  return [...users].sort((a, b) => {
    const aVal = getSortValue(a, sortBy)
    const bVal = getSortValue(b, sortBy)
    if (sortBy === 'accountAge') {
      return String(aVal).localeCompare(String(bVal))
    }
    return Number(bVal) - Number(aVal)
  })
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget
  const allImages = JSON.parse(img.dataset.images || '[]')
  let idx = parseInt(img.dataset.index || '0') + 1
  while (idx < allImages.length) {
    const nextUrl = allImages[idx]
    if (nextUrl && nextUrl !== img.src) {
      img.dataset.index = idx.toString()
      img.src = nextUrl
      return
    }
    idx++
  }
  img.src = '/default-avatar.png'
}
