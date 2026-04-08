import { NextRequest } from 'next/server'
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
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

const MODELS = [
  'gemini-3-flash-preview',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite'
]

interface UserData {
  userId: string
  userName: string
  profileImageUrl: string
  description: string
  tweets: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { teamA, teamB, note, mode } = await request.json()
    
    if (!teamA?.length || !teamB?.length) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 })
    }
    
    const totalUsers = teamA.length + teamB.length
    const tweetsPerUser = Math.floor(20000 / totalUsers)
    
    const client = await pool.connect()
    
    const allUsers: UserData[] = []
    
    for (const oderId of [...teamA, ...teamB]) {
      const userResult = await client.query(`
        SELECT user_name, user_profile_image_url, user_description
        FROM tweets
        WHERE LOWER(user_id) = LOWER($1)
        ORDER BY created_at DESC
        LIMIT 1
      `, [oderId])
      
      // RANDOMを廃止して最新ツイートを取得（CPU負荷軽減）
      const tweetsResult = await client.query(`
        SELECT display_text
        FROM tweets
        WHERE LOWER(user_id) = LOWER($1)
        AND display_text IS NOT NULL
        AND display_text != ''
        ORDER BY created_at DESC
        LIMIT $2
      `, [oderId, tweetsPerUser])
      
      if (userResult.rows.length > 0) {
        allUsers.push({
          userId: oderId,
          userName: userResult.rows[0].user_name || oderId,
          profileImageUrl: convertProfileImageUrl(userResult.rows[0].user_profile_image_url),
          description: userResult.rows[0].user_description || '',
          tweets: tweetsResult.rows.map(r => r.display_text)
        })
      }
    }
    
    client.release()
    
    const teamAUsers = allUsers.filter(u => teamA.includes(u.userId))
    const teamBUsers = allUsers.filter(u => teamB.includes(u.userId))
    
    const prompt = buildBattlePrompt(teamAUsers, teamBUsers, note || '', mode || 'battle')
    
    const aiStream = await callAIStream(prompt)
    
    if ('error' in aiStream) {
      return new Response(JSON.stringify({ error: aiStream.error }), { status: 500 })
    }
    
    return new Response(aiStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Battle error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

function buildBattlePrompt(teamA: UserData[], teamB: UserData[], note: string, mode: string): string {
  const teamAInfo = teamA.map(u => {
    const sampleTweets = u.tweets.slice(0, 100).join(' | ')
    return `${u.userName}(@${u.userId}): ${u.description || '(なし)'}\nツイート: ${sampleTweets}`
  }).join('\n')
  
  const teamBInfo = teamB.map(u => {
    const sampleTweets = u.tweets.slice(0, 100).join(' | ')
    return `${u.userName}(@${u.userId}): ${u.description || '(なし)'}\nツイート: ${sampleTweets}`
  }).join('\n')
  
  const teamANames = teamA.map(u => u.userName).join('、')
  const teamBNames = teamB.map(u => u.userName).join('、')
  
  let prompt = ''
  
  if (mode === 'manzai') {
    prompt = `漫才作家として以下のユーザーで漫才を書いて。
【出演者】
${teamAInfo}
${teamBInfo}
${note ? `【指示】${note}` : ''}
【ルール】コンビ名決定/ボケツッコミ決定/口調再現/「どうも〜」開始「もうええわ」終了/2000-3000字/セリフごと改行
【${teamANames}】×【${teamBNames}】漫才スタート！`

  } else if (mode === 'conte') {
    prompt = `コント作家として以下のユーザーでコントを書いて。
【出演者】
${teamAInfo}
${teamBInfo}
${note ? `【指示】${note}` : ''}
【ルール】口調再現/設定明示/予想外の展開/2000-3000字/セリフごと改行
【${teamANames}】×【${teamBNames}】コントスタート！`

  } else if (mode === 'rap') {
    prompt = `ラップバトル司会者として以下のユーザーでラップバトルを書いて。
【チームA】
${teamAInfo}
【チームB】
${teamBInfo}
${note ? `【指示】${note}` : ''}
【ルール】口調再現/韻を踏む/パンチライン/勝者決定/2000-3000字/バースごと改行/Yo!Check it!使用
【${teamANames}】VS【${teamBNames}】ラップバトル開幕！`

  } else if (mode === 'debate') {
    prompt = `ディベート司会者として以下のユーザーでディベートを書いて。
【肯定側】
${teamAInfo}
【否定側】
${teamBInfo}
${note ? `【指示】${note}` : ''}
【ルール】口調再現/立論→反駁→最終弁論/データ・例え話/勝者決定/2000-3000字
【${teamANames}】VS【${teamBNames}】ディベート開始！`

  } else if (mode === 'drama') {
    prompt = `ドラマ脚本家として以下のユーザーでドラマを書いて。
【主要キャスト】
${teamAInfo}
【対立キャスト】
${teamBInfo}
${note ? `【指示】${note}` : ''}
【ルール】口調再現/対立→葛藤→和解or決着/感情の起伏/印象的セリフ/2000-3000字
【${teamANames}】×【${teamBNames}】ドラマ開幕！`

  } else {
    // デフォルト: バトル
    prompt = `創作バトル小説作家として以下のユーザーで物理バトルを書いて。
【チームA】
${teamAInfo}
【チームB】
${teamBInfo}
${note ? `【指示】${note}` : ''}
【ルール】口調再現/物理戦闘(殴る蹴る必殺技)/固有能力設定/予測不能展開(乱入裏切り覚醒)/勝敗決定(引分禁止)/2000-3000字
【${teamANames}】VS【${teamBNames}】バトル開始！`
  }

  return prompt
}

async function callAIStream(prompt: string): Promise<ReadableStream | { error: string }> {
  
  for (const model of MODELS) {
    const url = `${OPENAI_API_BASE}/chat/completions`
    
    console.log(`[Battle] Trying model: ${model}`)
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          stream: true
        })
      })
      
      if (response.ok && response.body) {
        console.log(`[Battle] Success with ${model}`)
        return transformGeminiStream(response.body)
      }
      
      const errorText = await response.text().catch(() => '')
      console.log(`[Battle] ${model} error ${response.status}: ${errorText.slice(0, 100)}`)
      
      if (response.status === 429 || response.status === 503 || response.status === 500 || response.status === 404) {
        continue
      }
    } catch (e: any) {
      console.error(`[Battle Gemini] ${model} exception:`, e.message)
    }
  }
  
  return { error: 'All AI models failed' }
}

function transformGeminiStream(input: ReadableStream): ReadableStream {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let buffer = ''
  
  return new ReadableStream({
    async start(controller) {
      const reader = input.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          buffer += decoder.decode(value, { stream: true })
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
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thought: delta.reasoning_content })}\n\n`))
              }
              if (delta.content && typeof delta.content === 'string') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta.content })}\n\n`))
              }
            } catch {}
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
        controller.close()
      } catch (e) {
        controller.error(e)
      }
    }
  })
}
