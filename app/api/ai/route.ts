import { NextRequest, NextResponse } from 'next/server'

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

function reduceTweets(searchContext: string): string {
  const tweets = searchContext.split('\n\n')
  const half = Math.ceil(tweets.length / 2)
  return tweets.slice(0, half).join('\n\n')
}

interface MediaFile {
  data: string
  mimeType: string
}

function buildSystemPrompt(prompt: string, searchContext: string, conversationHistory: string): string {
  const today = new Date()
  const todayStr = today.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

  let systemPrompt = `あなたはHikamersSearchのAIアシスタントです。ユーザーの質問に対して、提供された検索結果（ツイート）を参考にして回答してください。

現在の日付: ${todayStr}

重要なルール:
1. 検索結果に基づいて回答してください
2. 検索結果にない情報は推測せず、「検索結果には見つかりませんでした」と伝えてください
3. 複数のツイートから情報をまとめて、わかりやすく説明してください
4. ツイートの投稿者名や日時も参考にしてください
5. 日本語で自然な回答を心がけてください
6. ユーザーが画像・動画・音声を添付した場合は、その内容も分析して回答に含めてください
7. 【最重要】引用番号のルール:
   - 引用番号は1文につき最大1個（例: 〇〇です[1]。）
   - 絶対に[1][2][3]のように連続させない
   - 引用番号の羅列は禁止（読みにくいため）
   - 同じ話題の複数ツイートは代表1つだけ引用
   - 回答全体で引用は10個以内
   - 引用なしでも良い（内容が明らかな場合）
8. 【関連質問の提案】回答の最後に、ユーザーが次に興味を持ちそうな関連質問を3〜5個提案してください。以下の形式で出力:
   ---RELATED_QUESTIONS---
   質問1
   質問2
   質問3
   ---END_RELATED_QUESTIONS---
   ※質問は検索結果の内容に基づいた具体的なものにしてください
   ※「〜について教えて」「〜は何？」「〜の詳細は？」などの形式で

`

  if (searchContext) {
    systemPrompt += `\n【検索結果】
形式: U:ID=名前(マッピング) [番号]ユーザーID 日付MMDD 時刻HHMM エンゲージメント:本文
※ID/日付省略時は直前と同一 R=リプ T=RT Q=引用 L=いいね(0は省略)
${searchContext}\n\n`
  } else {
    systemPrompt += `\n【検索結果】\n該当するツイートが見つかりませんでした。\n\n`
  }

  if (conversationHistory) {
    systemPrompt += `\n【会話履歴】\n${conversationHistory}\n\n`
  }

  systemPrompt += `\nユーザーの質問: ${prompt}\n\n回答:`
  return systemPrompt
}

async function callGeminiAPI(
  systemPrompt: string,
  mediaFiles?: MediaFile[],
  modelName?: string
): Promise<{ success: boolean; stream?: ReadableStream; rateLimited?: boolean; modelNotFound?: boolean; tokenLimitExceeded?: boolean; serverError?: boolean; error?: string }> {
  const model = modelName || MODELS[0]
  const url = `${OPENAI_API_BASE}/chat/completions`
  
  console.log(`[AI] Model: ${model}, Prompt: ${systemPrompt.length} chars`)

  // OpenAI互換形式でコンテンツを構築
  const userContent: any[] = [{ type: 'text', text: systemPrompt }]
  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach(file => {
      userContent.push({
        type: 'image_url',
        image_url: { url: `data:${file.mimeType};base64,${file.data}` }
      })
    })
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: userContent }],
        stream: true
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`[AI Gemini] Error ${response.status}: ${errorText.slice(0, 300)}`)
      
      if (response.status === 429) {
        return { success: false, rateLimited: true }
      }
      if (response.status === 404) {
        return { success: false, modelNotFound: true }
      }
      if (response.status === 503 || response.status === 500) {
        return { success: false, serverError: true, error: errorText }
      }
      if (errorText.includes('token') && (errorText.includes('exceeds') || errorText.includes('limit'))) {
        return { success: false, tokenLimitExceeded: true, error: errorText }
      }
      return { success: false, error: errorText }
    }

    if (!response.body) {
      return { success: false, error: 'No response body' }
    }

    return { success: true, stream: transformGeminiStream(response.body) }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

function transformGeminiStream(input: ReadableStream): ReadableStream {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let buffer = ''
  let hasContent = false
  let usageMetadata: any = null
  
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
              if (data.usage) {
                usageMetadata = data.usage
              }
            } catch {}
          }
        }
        
        // 残りのバッファも処理
        if (buffer.startsWith('data: ')) {
          const jsonStr = buffer.slice(6).trim()
          if (jsonStr && jsonStr !== '[DONE]') {
            try {
              const data = JSON.parse(jsonStr)
              
              if (data.usage) {
                usageMetadata = data.usage
              }
              
              const delta = data.choices?.[0]?.delta || {}
              if (delta.reasoning_content && typeof delta.reasoning_content === 'string') {
                hasContent = true
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thought: delta.reasoning_content })}\n\n`))
              }
              if (delta.content && typeof delta.content === 'string') {
                hasContent = true
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta.content })}\n\n`))
              }
              if (data.usage) {
                usageMetadata = data.usage
              }
            } catch {}
          }
        }
        
        if (!hasContent) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: '(応答を生成できませんでした)' })}\n\n`))
        }
        
        // トークン使用量を送信
        if (usageMetadata) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            tokenUsage: {
              promptTokens: usageMetadata.prompt_tokens || 0,
              completionTokens: usageMetadata.completion_tokens || 0,
              totalTokens: usageMetadata.total_tokens || 0
            }
          })}\n\n`))
        }
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
        controller.close()
      } catch (e: any) {
        console.error('[AI Stream] Error:', e.message)
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'ストリームエラー' })}\n\n`))
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
          controller.close()
        } catch {
          controller.error(e)
        }
      }
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'リクエストの解析に失敗しました' }, { status: 400 })
    }

    const { prompt, searchContext, conversationHistory, mediaFiles } = body

    if (!prompt) {
      return NextResponse.json({ error: 'プロンプトが必要です' }, { status: 400 })
    }

    let currentContext = searchContext || ''
    
    const tweetCount = (currentContext.match(/\[\d+\]/g) || []).length
    console.log(`[AI] Initial context: ${currentContext.length} chars, ~${tweetCount} tweets`)
    
    let retryCount = 0
    const maxRetries = 10
    let currentModelIndex = 0

    while (retryCount < maxRetries) {
      const systemPrompt = buildSystemPrompt(prompt, currentContext, conversationHistory || '')
      
      const model = MODELS[currentModelIndex] || MODELS[0]
      console.log(`[AI] Attempt ${retryCount + 1}, model: ${model}, context: ${currentContext.length} chars`)
      
      const result = await callGeminiAPI(systemPrompt, mediaFiles, model)
      
      if (result.success && result.stream) {
        console.log(`[AI Gemini] Success with ${model}, streaming...`)
        return new Response(result.stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        })
      }
      
      if (result.rateLimited || result.modelNotFound) {
        currentModelIndex++
        if (currentModelIndex >= MODELS.length) {
          currentModelIndex = 0
          currentContext = reduceTweets(currentContext)
          retryCount++
        }
        continue
      }
      
      // 503エラー（サーバーメンテナンス）も次のモデルへ
      if (result.serverError) {
        currentModelIndex++
        if (currentModelIndex >= MODELS.length) {
          currentModelIndex = 0
          currentContext = reduceTweets(currentContext)
          retryCount++
        }
        continue
      }
      
      if (result.tokenLimitExceeded) {
        currentContext = reduceTweets(currentContext)
        retryCount++
        continue
      }
      
      retryCount++
      currentContext = reduceTweets(currentContext)
    }

    return NextResponse.json({ error: 'リトライ上限に達しました。' }, { status: 500 })

  } catch (error: any) {
    console.error('AI API Error:', error)
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
