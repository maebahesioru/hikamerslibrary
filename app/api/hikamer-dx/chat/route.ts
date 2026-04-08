import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// プロフィール画像URL変換
function convertProfileImageUrl(url: string | null): string {
  if (!url) return '/default-avatar.png'
  if (url.startsWith('/pic/')) {
    const decoded = decodeURIComponent(url.replace('/pic/', ''))
    let finalUrl = `https://pbs.twimg.com/${decoded}`
    finalUrl = finalUrl.replace(/_bigger\./, '_400x400.').replace(/_normal\./, '_400x400.')
    return finalUrl
  }
  return url.replace(/_bigger\./, '_400x400.').replace(/_normal\./, '_400x400.')
}

// OpenAI互換API設定
const OPENAI_API_BASE = process.env.OPENAI_API_BASE || 'http://localhost:2048/v1'

const MODELS = [
  'gemini-3-flash-preview',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite'
]

// GET: ユーザー情報とサンプルツイートを取得
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('user')
  if (!userId) {
    return NextResponse.json({ error: 'user required' }, { status: 400 })
  }

  try {
    const client = await pool.connect()
    
    const userResult = await client.query(`
      SELECT 
        COALESCE(MAX(NULLIF(user_name, '')), $1) as user_name,
        COALESCE(MAX(NULLIF(user_profile_image_url, '')), '') as user_profile_image_url,
        COALESCE(MAX(NULLIF(user_description, '')), '') as user_description,
        array_agg(DISTINCT user_profile_image_url) FILTER (WHERE user_profile_image_url IS NOT NULL AND user_profile_image_url != '') as all_profile_images
      FROM tweets
      WHERE LOWER(user_id) = LOWER($1)
    `, [userId])
    
    const tweetsResult = await client.query(`
      SELECT display_text, created_at, likes_count, rt_count
      FROM tweets
      WHERE LOWER(user_id) = LOWER($1)
      AND display_text IS NOT NULL
      AND display_text != ''
      ORDER BY created_at DESC
      LIMIT 100
    `, [userId])
    
    client.release()
    
    if (userResult.rows.length === 0 || !userResult.rows[0].user_name) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const user = userResult.rows[0]
    const sampleTweets = tweetsResult.rows.map(t => t.display_text)
    
    const allImages = (user.all_profile_images || []) as string[]
    const convertedImages = allImages.map(convertProfileImageUrl).filter(Boolean)
    const sortedImages = [...convertedImages].sort((a, b) => {
      const aScore = a.startsWith('https://pbs.twimg.com') ? 0 : 1
      const bScore = b.startsWith('https://pbs.twimg.com') ? 0 : 1
      return aScore - bScore
    })
    const profileImageUrl = sortedImages[0] || convertProfileImageUrl(user.user_profile_image_url) || '/default-avatar.png'
    
    return NextResponse.json({
      userName: user.user_name,
      profileImageUrl,
      allProfileImages: sortedImages,
      description: user.user_description || '',
      sampleTweets
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=3600'
      }
    })
  } catch (error: any) {
    console.error('Chat GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: チャットメッセージを送信
export async function POST(request: NextRequest) {
  let client = null
  try {
    const body = await request.json().catch(() => null)
    
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
    
    const { userId, message, history, systemPrompt: customSystemPrompt, imageUrls, mediaFiles } = body
    
    if (!userId || !message) {
      return NextResponse.json({ error: 'userId and message required' }, { status: 400 })
    }
    
    if (typeof message !== 'string' || message.length > 10000) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }
    
    client = await pool.connect()
    
    const userResult = await client.query(`
      SELECT user_name, user_description, user_followers_count, user_following_count, 
             user_tweet_count, user_created_at
      FROM tweets
      WHERE LOWER(user_id) = LOWER($1)
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId])
    
    if (userResult.rows.length === 0) {
      client.release()
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const user = userResult.rows[0]
    
    // ツイートを取得（最新10000件 - CPU負荷軽減のためRANDOMを廃止）
    const tweetsResult = await client.query(`
      SELECT display_text, created_at, likes_count, rt_count, reply_count, qt_count,
             view_count, bookmark_count, in_reply_to_screen_name, quoted_tweet_text
      FROM tweets
      WHERE LOWER(user_id) = LOWER($1)
      AND display_text IS NOT NULL
      AND display_text != ''
      ORDER BY created_at DESC
      LIMIT 20000
    `, [userId])
    
    const tweets = tweetsResult.rows
    console.log(`[Chat] Loaded ${tweets.length} tweets for ${userId}`)
    
    client.release()
    client = null
    
    const systemPrompt = buildCharacterPrompt(userId, user, tweets, history || [], message, customSystemPrompt)
    console.log(`[Chat] Prompt length: ${systemPrompt.length} chars, ${tweets.length} tweets`)
    
    const aiStream = await callAI(systemPrompt, imageUrls, mediaFiles)
    
    if ('error' in aiStream) {
      console.error('[Chat] AI error:', aiStream.error)
      return NextResponse.json({ error: aiStream.error }, { status: 503 })
    }
    
    return new Response(aiStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('[Chat] POST error:', error.message, error.stack)
    return NextResponse.json({ 
      error: 'サーバーエラーが発生しました。しばらく待ってから再試行してください。' 
    }, { status: 500 })
  } finally {
    if (client) {
      try { client.release() } catch {}
    }
  }
}

function buildCharacterPrompt(
  userId: string,
  user: any,
  tweets: any[],
  history: { role: string; content: string }[],
  message: string,
  customSystemPrompt?: string
): string {
  const userName = user.user_name || userId
  const description = user.user_description || ''
  const followers = user.user_followers_count || 0
  const following = user.user_following_count || 0
  const tweetCount = user.user_tweet_count || 0
  const createdAt = user.user_created_at || ''
  
  // ツイートを圧縮形式で構築
  // 形式: MMDD HHMM エンゲージメント:本文
  let lastDate = ''
  const tweetTexts = tweets.map(t => {
    // 日時パース
    const dateMatch = t.created_at?.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)
    let dateStr = ''
    let timeStr = ''
    if (dateMatch) {
      const [, , month, day, hour, min] = dateMatch
      dateStr = `${month}${day}`
      timeStr = `${hour}${min}`
    }
    
    // エンゲージメント（0は省略）
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
    
    // 日付省略
    const showDate = dateStr !== lastDate
    lastDate = dateStr
    
    // リプライ/引用情報
    let prefix = ''
    if (t.in_reply_to_screen_name) prefix = `@${t.in_reply_to_screen_name}へ `
    
    // 組み立て
    let line = showDate ? `${dateStr} ${timeStr}` : timeStr
    if (engStr) line += ` ${engStr}`
    line += `:${prefix}${(t.display_text || '').replace(/\n/g, ' ')}`
    
    return line
  }).join('\n')
  
  let prompt = `あなたは「${userName}」(@${userId})になりきってください。

【プロフィール】
${userName} @${userId} | ${description || '(なし)'}
フォロワー${followers} フォロー${following} ツイート${tweetCount} 作成${createdAt}

【ツイート${tweets.length}件】形式:MMDD HHMM エンゲージメント:本文(日付省略時は直前と同一,R=リプT=RT Q=引用L=いいね,0省略)
${tweetTexts}

【ルール】文体・口調・絵文字を真似/AIと言わない/エンゲージメント数字は出力しない
`

  if (customSystemPrompt) {
    prompt += `【指示】${customSystemPrompt}\n`
  }

  if (history && history.length > 0) {
    prompt += '【会話】\n'
    for (const h of history.slice(-10)) {
      prompt += h.role === 'user' ? `相手:${h.content}\n` : `${userName}:${h.content}\n`
    }
  }
  
  prompt += `【メッセージ】${message}
【返答】最後に関連質問3つを以下形式で:
---RELATED_QUESTIONS---
質問1
質問2
質問3
---END_RELATED_QUESTIONS---`
  
  return prompt
}

async function callAI(prompt: string, imageUrls?: string[], mediaFiles?: { url: string; type: string }[]): Promise<ReadableStream | { error: string }> {
  const apiKey = process.env.OPENAI_API_KEY || ''
  
  for (const model of MODELS) {
    const url = `${OPENAI_API_BASE}/chat/completions`
    
    console.log(`[Chat] Trying model: ${model}`)
    
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 120000)
      
      // OpenAI互換形式でコンテンツを構築
      const userContent: any[] = [{ type: 'text', text: prompt }]
      
      if (imageUrls && imageUrls.length > 0) {
        for (const imageUrl of imageUrls) {
          userContent.push({ type: 'image_url', image_url: { url: imageUrl } })
        }
        console.log(`[Chat] Including ${imageUrls.length} images (legacy)`)
      }
      
      if (mediaFiles && mediaFiles.length > 0) {
        for (const media of mediaFiles) {
          userContent.push({ type: 'image_url', image_url: { url: media.url } })
        }
        console.log(`[Chat] Including ${mediaFiles.length} media files`)
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: userContent }],
          stream: true
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeout)
      
      if (response.ok && response.body) {
        console.log(`[Chat] Success with ${model}, streaming...`)
        return transformGeminiStream(response.body)
      }
      
      const errorText = await response.text().catch(() => '')
      console.log(`[Chat] ${model} error ${response.status}: ${errorText.slice(0, 200)}`)
      
      if (response.status === 429 || response.status === 503 || response.status === 500 || response.status === 404) {
        continue
      }
    } catch (e: any) {
      const errMsg = e.name === 'AbortError' ? 'Timeout' : e.message
      console.error(`[Chat] ${model} exception:`, errMsg)
    }
  }
  
  return { error: `AI応答に失敗しました。しばらく待ってから再試行してください。` }
}

function transformGeminiStream(input: ReadableStream): ReadableStream {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let buffer = ''
  let hasContent = false
  
  return new ReadableStream({
    async start(controller) {
      const reader = input.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const jsonStr = line.slice(6).trim()
            if (!jsonStr || jsonStr === '[DONE]') continue
            
            try {
              const data = JSON.parse(jsonStr)
              const delta = data.choices?.[0]?.delta || {}
              if (delta.reasoning_content && typeof delta.reasoning_content === 'string') {
                hasContent = true
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thought: delta.reasoning_content })}\n\n`))
              }
              if (delta.content && typeof delta.content === 'string') {
                hasContent = true
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta.content })}\n\n`))
              }
            } catch (e) {
              // パースエラーは無視
            }
          }
        }
        
        // 残りのバッファも処理
        if (buffer.startsWith('data: ')) {
          const jsonStr = buffer.slice(6).trim()
          if (jsonStr && jsonStr !== '[DONE]') {
            try {
              const data = JSON.parse(jsonStr)
              const delta = data.choices?.[0]?.delta || {}
              if (delta.reasoning_content && typeof delta.reasoning_content === 'string') {
                hasContent = true
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thought: delta.reasoning_content })}\n\n`))
              }
              if (delta.content && typeof delta.content === 'string') {
                hasContent = true
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta.content })}\n\n`))
              }
            } catch {}
          }
        }
        
        if (!hasContent) {
          console.log('[Gemini Stream] No content received')
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: '(応答を生成できませんでした)' })}\n\n`))
        }
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
        controller.close()
      } catch (e: any) {
        console.error('[Gemini Stream] Error:', e.message)
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'ストリームエラーが発生しました' })}\n\n`))
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
          controller.close()
        } catch {
          controller.error(e)
        }
      }
    }
  })
}
