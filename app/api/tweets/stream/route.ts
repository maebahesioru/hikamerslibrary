import { NextResponse } from 'next/server'
import { getPool, toTweet } from '@/lib/postgres'
import { calculateAdvancedScore, penalizeSimilarTweets, diversifyResults } from '@/app/utils/searchScoring'
import { getCacheKey, getFromCache, setCache } from '@/app/utils/searchCache'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cacheKey = getCacheKey(searchParams)
    const cached = getFromCache(cacheKey)
    if (cached) {
      return NextResponse.json(cached, { 
        headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } 
      })
    }

    // パラメータ取得
    const query = searchParams.get('q') || ''
    const mediaFilter = searchParams.get('tbm') || ''
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const fromUser = searchParams.get('from') || ''
    const toUser = searchParams.get('to') || ''
    const since = searchParams.get('since') || ''
    const until = searchParams.get('until') || ''
    const minLikes = parseInt(searchParams.get('minLikes') || '0')
    const minRts = parseInt(searchParams.get('minRts') || '0')
    const minReplies = parseInt(searchParams.get('minReplies') || '0')
    const minViews = parseInt(searchParams.get('minViews') || '0')
    const minBookmarks = parseInt(searchParams.get('minBookmarks') || '0')
    const excludeWords = searchParams.get('exclude') || ''
    const orWords = searchParams.get('or') || ''
    const hasMedia = searchParams.get('hasMedia') || ''
    const hasReply = searchParams.get('hasReply') || ''
    const hasQuote = searchParams.get('hasQuote') || ''
    const hasHashtag = searchParams.get('hasHashtag') || ''
    const hasMention = searchParams.get('hasMention') || ''
    const verified = searchParams.get('verified') || ''
    const lang = searchParams.get('lang') || ''
    const searchLevel = parseInt(searchParams.get('searchLevel') || '3')

    const levelConfig = {
      1: { maxTweets: 500 },
      2: { maxTweets: 3000 },
      3: { maxTweets: 25000 }
    }
    const config = levelConfig[searchLevel as 1 | 2 | 3] || levelConfig[3]

    if (!query && !fromUser) {
      return NextResponse.json({ error: 'Query or from parameter required' }, { status: 400 })
    }

    console.log(`[Stream API] Searching for: "${query}" (sortBy: ${sortBy}, level: ${searchLevel})`)
    const startTime = Date.now()
    const isAiSearch = searchParams.has('searchLevel')

    // キーワード解析（シンプルに分割のみ）
    const keywords = query.split(/[\s　]+/).filter(w => w.length > 0)

    const client = getPool()
    const likeArgs: string[] = []
    keywords.forEach(k => likeArgs.push(k))

    // OR条件構築（複数カラムをマッチ）
    const searchColumns = ['display_text', 'hashtags', 'mentions', 'in_reply_to_user_id', 'quoted_tweet_text', 'user_id', 'user_name', 'user_description', 'user_location']
    const orConditionsArr = keywords.map((_, i) => {
      const colConditions = searchColumns.map(col => `${col} LIKE '%' || $${i + 1} || '%'`)
      return `(${colConditions.join(' OR ')})`
    })
    const orLikeConditions = orConditionsArr.length > 0 ? orConditionsArr.join(' OR ') : '1=1'

    // DBスコアリング用CASE文
    let scoreCase = '0'
    if (keywords.length > 1) {
      const allMatch = keywords.map((_, i) => `display_text LIKE '%' || $${i + 1} || '%'`).join(' AND ')
      scoreCase = `CASE WHEN ${allMatch} THEN 15000 ELSE 0 END`
    }

    // フィルター条件構築
    let conditions = ''
    if (mediaFilter === 'isch' || hasMedia === 'photo') conditions += ` AND media_type LIKE '%photo%'`
    else if (mediaFilter === 'vid' || hasMedia === 'video') conditions += ` AND media_type LIKE '%video%'`
    else if (hasMedia === 'any') conditions += ` AND media_type IS NOT NULL AND media_type != ''`

    if (since && until) conditions += ` AND DATE(created_at) BETWEEN '${since}' AND '${until}'`
    else if (since) conditions += ` AND DATE(created_at) >= '${since}'`
    else if (until) conditions += ` AND DATE(created_at) <= '${until}'`

    if (fromUser) conditions += ` AND (user_id = '${fromUser}' OR user_id = '@${fromUser}')`
    if (toUser) conditions += ` AND in_reply_to_screen_name = '${toUser}'`
    if (minLikes > 0) conditions += ` AND CAST(likes_count AS INTEGER) >= ${minLikes}`
    if (minRts > 0) conditions += ` AND CAST(rt_count AS INTEGER) >= ${minRts}`
    if (minReplies > 0) conditions += ` AND CAST(reply_count AS INTEGER) >= ${minReplies}`
    if (minViews > 0) conditions += ` AND CAST(view_count AS INTEGER) >= ${minViews}`
    if (minBookmarks > 0) conditions += ` AND CAST(bookmark_count AS INTEGER) >= ${minBookmarks}`
    if (lang) conditions += ` AND lang = '${lang}'`
    if (excludeWords) {
      excludeWords.split(',').map(w => w.trim()).filter(w => w).forEach(word => {
        conditions += ` AND display_text NOT LIKE '%${word}%'`
      })
    }
    if (orWords) {
      const orList = orWords.split(',').map(w => w.trim()).filter(w => w)
      if (orList.length > 0) {
        const orClauses = orList.map(word => `display_text LIKE '%${word}%'`).join(' OR ')
        conditions += ` AND (${orClauses})`
      }
    }
    if (hasReply === 'true') conditions += ` AND in_reply_to_tweet_id IS NOT NULL AND in_reply_to_tweet_id != ''`
    else if (hasReply === 'false') conditions += ` AND (in_reply_to_tweet_id IS NULL OR in_reply_to_tweet_id = '')`
    if (hasQuote === 'true') conditions += ` AND quoted_tweet_id IS NOT NULL AND quoted_tweet_id != ''`
    else if (hasQuote === 'false') conditions += ` AND (quoted_tweet_id IS NULL OR quoted_tweet_id = '')`
    if (hasHashtag) conditions += ` AND hashtags LIKE '%${hasHashtag}%'`
    if (hasMention) conditions += ` AND mentions LIKE '%${hasMention}%'`
    if (verified === 'true') conditions += ` AND (user_verified = 'true' OR user_verified = '1')`

    // ソート
    let orderClause = ''
    switch (sortBy) {
      case 'popular': orderClause = 'ORDER BY (COALESCE(rt_count::int,0) * 3 + COALESCE(qt_count::int,0) * 2 + COALESCE(reply_count::int,0) * 2 + COALESCE(likes_count::int,0)) DESC'; break
      case 'oldest': orderClause = 'ORDER BY created_at ASC'; break
      case 'latest': orderClause = 'ORDER BY created_at DESC'; break
      default: orderClause = 'ORDER BY created_at DESC'
    }

    let total = 0
    let rows: any[] = []

    // 検索実行
    if (isAiSearch) {
      const result = await client.query(
        `SELECT * FROM tweets WHERE (${orLikeConditions}) ${conditions} ORDER BY created_at DESC LIMIT $${keywords.length + 1} OFFSET $${keywords.length + 2}`,
        [...likeArgs, limit, offset]
      )
      rows = result.rows
      total = rows.length < limit ? offset + rows.length : offset + rows.length + 1000
    } else if (sortBy === 'relevance') {
      // シンプルなクエリ（DBスコアリングは複数キーワード時のみ）
      const orderBy = keywords.length > 1 
        ? `ORDER BY ${scoreCase} DESC, created_at DESC`
        : 'ORDER BY created_at DESC'
      const result = await client.query(
        `SELECT * FROM tweets WHERE (${orLikeConditions}) ${conditions} ${orderBy} LIMIT $${keywords.length + 1} OFFSET $${keywords.length + 2}`,
        [...likeArgs, limit, offset]
      )
      rows = result.rows
      total = rows.length < limit ? offset + rows.length : offset + rows.length + 1000
    } else {
      const result = await client.query(
        `SELECT * FROM tweets WHERE (${orLikeConditions}) ${conditions} ${orderClause} LIMIT $${keywords.length + 1} OFFSET $${keywords.length + 2}`,
        [...likeArgs, limit, offset]
      )
      rows = result.rows
      total = rows.length < limit ? offset + rows.length : offset + rows.length + 1000
    }

    let tweets = rows.map(row => toTweet(row))

    // JSスコアリング（relevance検索時のみ、取得後の微調整）
    if (!isAiSearch && sortBy === 'relevance' && tweets.length > 0) {
      const termDocCounts = new Map<string, number>()
      let totalLength = 0
      keywords.forEach(keyword => {
        const count = tweets.filter(t => (t.displayText || '').toLowerCase().includes(keyword.toLowerCase())).length
        termDocCounts.set(keyword, count)
      })
      tweets.forEach(t => { totalLength += (t.displayText || '').length })
      const avgDocLength = totalLength / tweets.length

      let scoredTweets = tweets.map(tweet => {
        const advancedScore = calculateAdvancedScore(tweet, query, keywords, tweets.length, termDocCounts, [], avgDocLength)
        // カラム別スコアリング（display_text最優先、ユーザー情報のみマッチは大幅ペナルティ）
        let columnBonus = 0
        for (const keyword of keywords) {
          const kLower = keyword.toLowerCase()
          if ((tweet.displayText || '').toLowerCase().includes(kLower)) columnBonus += 10000
          if ((tweet.hashtags || '').toLowerCase().includes(kLower)) columnBonus += 3000
          if ((tweet.quotedTweetText || '').toLowerCase().includes(kLower)) columnBonus += 2000
          if ((tweet.mentions || '').toLowerCase().includes(kLower)) columnBonus += 1500
          if ((tweet.userId || '').toLowerCase().includes(kLower)) columnBonus -= 10000
          if ((tweet.userName || '').toLowerCase().includes(kLower)) columnBonus -= 10000
          if ((tweet.userDescription || '').toLowerCase().includes(kLower)) columnBonus -= 5000
          if ((tweet.userLocation || '').toLowerCase().includes(kLower)) columnBonus -= 3000
        }
        return { tweet, score: advancedScore + columnBonus }
      })
      scoredTweets.sort((a, b) => b.score - a.score)
      scoredTweets = penalizeSimilarTweets(scoredTweets)
      scoredTweets.sort((a, b) => b.score - a.score)
      tweets = scoredTweets.map(st => st.tweet)
      tweets = diversifyResults(tweets)
      tweets = tweets.slice(0, limit)
    } else if (isAiSearch) {
      tweets = tweets.slice(0, limit)
    }

    const hasMore = offset + limit < total
    const endTime = Date.now()
    console.log(`[Stream API] Found ${total} tweets in ${endTime - startTime}ms (level ${searchLevel}, limit ${limit})`)

    const responseData = { tweets, count: tweets.length, total, hasMore, offset, limit }
    setCache(cacheKey, responseData)

    return NextResponse.json(responseData, { 
      headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } 
    })
  } catch (error) {
    console.error('[Stream API] Error:', error)
    return NextResponse.json({ error: 'Failed to search tweets' }, { status: 500 })
  }
}
