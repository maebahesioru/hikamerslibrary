import { SearchQuery, LightTweet } from './types'

export const MAX_TWEETS = 20000

export function sortByEngagement(tweets: any[]): any[] {
  return [...tweets].sort((a, b) => {
    const engagementA = (parseInt(a.replyCount) || 0) + (parseInt(a.rtCount) || 0) * 3 + (parseInt(a.qtCount) || 0) * 2.5 + (parseInt(a.likesCount) || 0)
    const engagementB = (parseInt(b.replyCount) || 0) + (parseInt(b.rtCount) || 0) * 3 + (parseInt(b.qtCount) || 0) * 2.5 + (parseInt(b.likesCount) || 0)
    return engagementB - engagementA
  })
}

export function toLightTweet(t: any): LightTweet {
  return {
    id: t.id,
    createdAt: t.createdAt,
    displayText: t.displayText,
    replyCount: t.replyCount,
    rtCount: t.rtCount,
    qtCount: t.qtCount,
    likesCount: t.likesCount,
    inReplyToScreenName: t.inReplyToScreenName,
    quotedTweetText: t.quotedTweetText,
    userName: t.userName || t.name,
    name: t.userName || t.name,
    userId: t.userId
  }
}

export function buildSearchParams(sq: SearchQuery): URLSearchParams {
  const params = new URLSearchParams()
  params.set('q', sq.keyword)
  params.set('limit', String(sq.count))
  if (sq.from) params.set('from', sq.from)
  if (sq.to) params.set('to', sq.to)
  if (sq.since) params.set('since', sq.since)
  if (sq.until) params.set('until', sq.until)
  if (sq.minLikes) params.set('minLikes', String(sq.minLikes))
  if (sq.minRts) params.set('minRts', String(sq.minRts))
  if (sq.minReplies) params.set('minReplies', String(sq.minReplies))
  if (sq.minViews) params.set('minViews', String(sq.minViews))
  if (sq.minBookmarks) params.set('minBookmarks', String(sq.minBookmarks))
  if (sq.exclude) params.set('exclude', sq.exclude)
  if (sq.or) params.set('or', sq.or)
  if (sq.hasMedia) params.set('hasMedia', sq.hasMedia)
  if (sq.hasReply) params.set('hasReply', sq.hasReply)
  if (sq.hasQuote) params.set('hasQuote', sq.hasQuote)
  if (sq.hasHashtag) params.set('hasHashtag', sq.hasHashtag)
  if (sq.hasMention) params.set('hasMention', sq.hasMention)
  if (sq.verified) params.set('verified', sq.verified)
  if (sq.lang) params.set('lang', sq.lang)
  return params
}

export function getDateFilter(query: string): ((tweet: any) => boolean) | null {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (/昨日/.test(query)) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const dayAfter = new Date(yesterday)
    dayAfter.setDate(dayAfter.getDate() + 1)
    return (tweet: any) => {
      const d = new Date(tweet.createdAt.replace(' JST', '+09:00'))
      return d >= yesterday && d < dayAfter
    }
  } else if (/今日/.test(query)) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return (tweet: any) => {
      const d = new Date(tweet.createdAt.replace(' JST', '+09:00'))
      return d >= today && d < tomorrow
    }
  } else if (/一週間|1週間/.test(query)) {
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    return (tweet: any) => new Date(tweet.createdAt.replace(' JST', '+09:00')) >= weekAgo
  }
  return null
}

export function buildCompressedContext(tweets: any[], prefix = ''): string {
  const userNameMap = new Map<string, number>()
  let userIdCounter = 1
  tweets.forEach(t => {
    const name = t.userName || t.name
    if (name && !userNameMap.has(name)) {
      userNameMap.set(name, userIdCounter++)
    }
  })

  let searchContext = prefix
  if (userNameMap.size > 0) {
    const mappings = Array.from(userNameMap.entries()).map(([name, id]) => `${id}=${name}`).join(',')
    searchContext += `U:${mappings}\n`
  }
  
  let lastUserId = 0
  let lastDate = ''
  for (let i = 0; i < tweets.length; i++) {
    const tweet = tweets[i]
    const userName = tweet.userName || tweet.name
    const userId = userNameMap.get(userName) || 0
    
    const dateMatch = tweet.createdAt?.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)
    let dateStr = ''
    let timeStr = ''
    if (dateMatch) {
      const [, , month, day, hour, min] = dateMatch
      dateStr = `${month}${day}`
      timeStr = `${hour}${min}`
    }
    
    const r = parseInt(tweet.replyCount) || 0
    const rt = parseInt(tweet.rtCount) || 0
    const q = parseInt(tweet.qtCount) || 0
    const l = parseInt(tweet.likesCount) || 0
    const engagements: string[] = []
    if (r > 0) engagements.push(`R${r}`)
    if (rt > 0) engagements.push(`T${rt}`)
    if (q > 0) engagements.push(`Q${q}`)
    if (l > 0) engagements.push(`L${l}`)
    const engStr = engagements.join(' ')
    
    const showUser = userId !== lastUserId
    lastUserId = userId
    const showDate = dateStr !== lastDate
    lastDate = dateStr
    
    let line = `[${i + 1}]`
    if (showUser) line += userId
    line += ' '
    if (showDate) line += dateStr + ' '
    line += timeStr
    if (engStr) line += ' ' + engStr
    line += ':' + (tweet.displayText || '').replace(/\n/g, ' ')
    
    searchContext += line + '\n'
  }
  
  return searchContext
}

export function extractRelatedQuestions(text: string): { cleanText: string; questions: string[] } {
  const relatedMatch = text.match(/---RELATED_QUESTIONS---([\s\S]*?)---END_RELATED_QUESTIONS---/)
  if (relatedMatch) {
    const questions = relatedMatch[1]
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('---'))
    const cleanText = text.replace(/---RELATED_QUESTIONS---[\s\S]*?---END_RELATED_QUESTIONS---/g, '').trim()
    return { cleanText, questions }
  }
  return { cleanText: text, questions: [] }
}
