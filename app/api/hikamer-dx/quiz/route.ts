import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { parseJsonQuestion, isValidQuestion } from './parseQuestion'
import { callGeminiAPIStream } from './gemini'
import { buildQuizPrompt } from './prompt'

// Vercel Serverless Function timeout (Pro plan: max 300s, Hobby: max 60s)
export const maxDuration = 300

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// GET: ユーザー検索
export async function GET(request: NextRequest) {
  const searchUser = request.nextUrl.searchParams.get('searchUser')
  if (!searchUser) {
    return NextResponse.json({ users: [] })
  }
  
  let client = null
  try {
    client = await pool.connect()
    const matchResult = await client.query(`
      SELECT DISTINCT LOWER(user_id) as lower_user_id
      FROM tweets
      WHERE (LOWER(user_id) LIKE LOWER($1) OR LOWER(user_name) LIKE LOWER($1))
        AND user_id IS NOT NULL
        AND user_id != ''
        AND LENGTH(user_id) > 1
      LIMIT 20
    `, [`%${searchUser}%`])
    
    if (matchResult.rows.length === 0) {
      client.release()
      return NextResponse.json({ users: [] })
    }
    
    const userIds = matchResult.rows.map(r => r.lower_user_id)
    
    const result = await client.query(`
      SELECT 
        (array_agg(user_id ORDER BY created_at DESC))[1] as user_id,
        (array_agg(user_name ORDER BY created_at DESC))[1] as user_name,
        COUNT(*) as tweet_count
      FROM tweets
      WHERE LOWER(user_id) = ANY($1)
      GROUP BY LOWER(user_id)
      ORDER BY tweet_count DESC
      LIMIT 10
    `, [userIds])
    
    client.release()
    return NextResponse.json({
      users: result.rows.map(r => ({
        userId: r.user_id,
        userName: r.user_name,
        tweetCount: parseInt(r.tweet_count)
      }))
    })
  } catch (error: unknown) {
    if (client) client.release()
    const err = error as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: クイズを生成（ストリーミング）
export async function POST(request: NextRequest) {
  let client = null
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { category = 'all', count = 5, startDate, endDate, userId } = body
    
    client = await pool.connect()
    
    // 日付フィルター
    let dateFilter = ''
    let dateInfo = ''
    if (startDate && endDate) {
      dateFilter = `AND t.created_at >= '${startDate}' AND t.created_at <= '${endDate} 23:59:59'`
      dateInfo = `【期間】${startDate} 〜 ${endDate}`
    } else if (startDate) {
      dateFilter = `AND t.created_at >= '${startDate}'`
      dateInfo = `【期間】${startDate} 以降`
    } else if (endDate) {
      dateFilter = `AND t.created_at <= '${endDate} 23:59:59'`
      dateInfo = `【期間】${endDate} まで`
    }
    
    // 人物フィルター
    let userFilter = ''
    let userInfo = ''
    if (category === 'people' && userId) {
      userFilter = `AND LOWER(t.user_id) = LOWER('${userId.replace(/'/g, "''")}')`
      userInfo = `【対象人物】@${userId}`
    }
    
    // ツイート取得
    const tweetsResult = await fetchTweets(client, category, userId, dateFilter, userFilter)
    
    client.release()
    client = null
    
    const tweets = tweetsResult.rows
    const tweetContext = buildTweetContext(tweets)
    const prompt = buildQuizPrompt({ category, count, dateInfo, userInfo, tweetContext })

    console.log(`[Quiz] Streaming ${count} questions, category: ${category}`)
    console.log(`[Quiz] Context: ${tweetContext.length} chars, ${tweets.length} tweets`)
    
    // ストリーミングレスポンス
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let questionCount = 0
        let buffer = ''
        const failedLines: string[] = []
        
        try {
          for await (const chunk of callGeminiAPIStream(prompt)) {
            buffer += chunk
            
            // 改行で分割してJSON行を探す
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // 最後の不完全な行を保持
            
            for (const line of lines) {
              const trimmed = line.trim()
              if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                const q = parseJsonQuestion(trimmed, category)
                if (isValidQuestion(q)) {
                  questionCount++
                  controller.enqueue(encoder.encode(JSON.stringify(q) + '\n'))
                } else {
                  failedLines.push(trimmed)
                }
              }
            }
          }
          
          // 残りのバッファを処理
          if (buffer.trim().startsWith('{') && buffer.trim().endsWith('}')) {
            const q = parseJsonQuestion(buffer.trim(), category)
            if (isValidQuestion(q)) {
              questionCount++
              controller.enqueue(encoder.encode(JSON.stringify(q) + '\n'))
            } else {
              failedLines.push(buffer.trim())
            }
          }
          
          // 失敗した行を修復して再試行
          for (const line of failedLines) {
            const repaired = repairJsonLine(line)
            if (repaired) {
              const q = parseJsonQuestion(repaired, category)
              if (isValidQuestion(q)) {
                questionCount++
                controller.enqueue(encoder.encode(JSON.stringify(q) + '\n'))
                console.log(`[Quiz] Repaired JSON: ${line.slice(0, 50)}...`)
              }
            }
          }
          
          console.log(`[Quiz] Streamed ${questionCount} questions`)
          
          if (questionCount === 0) {
            controller.enqueue(encoder.encode(JSON.stringify({ error: 'クイズの生成に失敗しました' }) + '\n'))
          }
        } catch (e: unknown) {
          const err = e as Error
          console.error('[Quiz] Stream error:', err.message)
          controller.enqueue(encoder.encode(JSON.stringify({ error: err.message }) + '\n'))
        } finally {
          controller.close()
        }
      }
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache'
      }
    })
    
  } catch (error: unknown) {
    console.error('[Quiz] Error:', error)
    const err = error as Error
    if (client) {
      try { client.release() } catch {}
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ツイート取得
async function fetchTweets(client: any, category: string, userId: string | undefined, dateFilter: string, userFilter: string) {
  if (category === 'people' && userId) {
    return client.query(`
      SELECT display_text, created_at, likes_count, rt_count, view_count,
             user_id, user_name, reply_count, qt_count, bookmark_count,
             in_reply_to_screen_name, quoted_tweet_text, hashtags, mentions
      FROM tweets t
      WHERE t.display_text IS NOT NULL AND t.display_text != ''
      ${dateFilter}
      ${userFilter}
      ORDER BY created_at DESC
      LIMIT 20000
    `)
  }
  
  return client.query(`
    WITH yearly_tweets AS (
      SELECT t.display_text, t.created_at, t.likes_count, t.rt_count, t.view_count,
             t.user_id, t.user_name, t.reply_count, t.qt_count, t.bookmark_count,
             t.in_reply_to_screen_name, t.quoted_tweet_text, t.hashtags, t.mentions,
             ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM t.created_at::timestamp) ORDER BY RANDOM()) as rn
      FROM tweets t
      WHERE t.display_text IS NOT NULL AND t.display_text != ''
      ${dateFilter}
    )
    SELECT display_text, created_at, likes_count, rt_count, view_count,
           user_id, user_name, reply_count, qt_count, bookmark_count,
           in_reply_to_screen_name, quoted_tweet_text, hashtags, mentions
    FROM yearly_tweets
    WHERE rn <= 20000
    ORDER BY created_at DESC
  `)
}

// ツイートコンテキスト構築
function buildTweetContext(tweets: any[]): string {
  let lastUser = ''
  let lastDate = ''
  const userMap = new Map<string, number>()
  let userIdx = 1
  
  const tweetLines: string[] = []
  for (const t of tweets.slice(0, 20000)) {
    const uid = t.user_id || ''
    const uname = t.user_name || uid
    
    if (!userMap.has(uid)) {
      userMap.set(uid, userIdx++)
    }
    const uidNum = userMap.get(uid)!
    
    const dateMatch = t.created_at?.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)
    let dateStr = ''
    let timeStr = ''
    if (dateMatch) {
      const [, , month, day, hour, min] = dateMatch
      dateStr = `${month}${day}`
      timeStr = `${hour}${min}`
    }
    
    const r = parseInt(t.reply_count) || 0
    const rt = parseInt(t.rt_count) || 0
    const q = parseInt(t.qt_count) || 0
    const l = parseInt(t.likes_count) || 0
    const engagements: string[] = []
    if (r > 0) engagements.push(`R${r}`)
    if (rt > 0) engagements.push(`T${rt}`)
    if (q > 0) engagements.push(`Q${q}`)
    if (l > 0) engagements.push(`L${l}`)
    const engStr = engagements.join(' ')
    
    const showUser = uid !== lastUser
    const showDate = dateStr !== lastDate
    lastUser = uid
    lastDate = dateStr
    
    let line = showUser ? `[${uidNum}]` : ''
    line += showDate ? `${dateStr} ${timeStr}` : timeStr
    if (engStr) line += ` ${engStr}`
    line += `:${(t.display_text || '').replace(/\n/g, ' ').slice(0, 200)}`
    
    tweetLines.push(line)
  }
  
  // ユーザーマッピング
  const userMapping = Array.from(userMap.entries())
    .map(([uid, idx]) => {
      const u = tweets.find(t => t.user_id === uid)
      return `${idx}=${u?.user_name || uid}`
    }).join(',')
  
  return `U:${userMapping}\n${tweetLines.join('\n')}`
}


// JSON行を修復
function repairJsonLine(line: string): string | null {
  try {
    // 末尾のカンマを除去
    let fixed = line.replace(/,\s*}$/, '}')
    
    // シングルクォートをダブルクォートに
    fixed = fixed.replace(/'/g, '"')
    
    // キーにクォートがない場合を修復
    fixed = fixed.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
    
    // パースを試行
    JSON.parse(fixed)
    return fixed
  } catch (e) {
    return null
  }
}
