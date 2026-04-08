// Gemini API client

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

// ストリーミング版
export async function* callGeminiAPIStream(prompt: string): AsyncGenerator<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('API key is not configured')
  }
  
  for (const model of MODELS) {
    const url = `${OPENAI_API_BASE}/chat/completions`
    
    console.log(`[Quiz] Trying stream model: ${model}`)
    
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
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log(`[Quiz] ${model} error ${response.status}: ${errorText.slice(0, 200)}`)
        if (response.status === 429 || response.status === 503 || response.status === 500 || response.status === 404) {
          continue
        }
        throw new Error(`API error: ${response.status}`)
      }
      
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')
      
      const decoder = new TextDecoder()
      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const json = JSON.parse(data)
              const text = json.choices?.[0]?.delta?.content || ''
              if (text) yield text
            } catch {}
          }
        }
      }
      
      console.log(`[Quiz] Stream success with ${model}`)
      return
      
    } catch (e: unknown) {
      const error = e as Error
      console.error(`[Quiz] ${model} exception:`, error.message)
    }
  }
  
  throw new Error('すべてのモデルで失敗しました')
}

// 非ストリーミング版（互換性のため残す）
export async function callGeminiAPI(prompt: string): Promise<{ success: boolean; text?: string; error?: string }> {
  if (!OPENAI_API_KEY) {
    console.error('[Quiz] OPENAI_API_KEY is not set')
    return { success: false, error: 'API key is not configured' }
  }
  
  const errors: string[] = []
  
  for (const model of MODELS) {
    const url = `${OPENAI_API_BASE}/chat/completions`
    
    console.log(`[Quiz] Trying model: ${model}`)
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log(`[Quiz] ${model} error ${response.status}: ${errorText.slice(0, 200)}`)
        errors.push(`${model}: ${response.status}`)
        if (response.status === 429 || response.status === 503 || response.status === 500 || response.status === 404) {
          continue
        }
        return { success: false, error: `API error: ${response.status}` }
      }
      
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || ''
      
      if (text) {
        console.log(`[Quiz] Success with ${model}`)
        return { success: true, text }
      }
    } catch (e: unknown) {
      const error = e as Error
      console.error(`[Quiz] ${model} exception:`, error.message)
      errors.push(`${model}: ${error.message}`)
    }
  }
  
  return { success: false, error: `すべてのモデルで失敗: ${errors.join(', ')}` }
}
