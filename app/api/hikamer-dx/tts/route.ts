import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_BASE = process.env.OPENAI_API_BASE || 'http://localhost:2048/v1'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

// TTSモデルリスト（フォールバック用）
const TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
  'gemini-2.0-flash-preview-tts'
]

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    
    if (!text) {
      return NextResponse.json({ error: 'text required' }, { status: 400 })
    }
    
    // テキストを3000文字に制限
    const truncatedText = text.slice(0, 3000)
    const baseUrl = OPENAI_API_BASE.replace(/\/v1\/?$/, '')
    
    console.log(`[TTS] Generating speech for ${truncatedText.length} chars`)
    
    // 各モデルを試す
    for (const model of TTS_MODELS) {
      const url = `${baseUrl}/v1beta/models/${model}:generateContent`
      
      console.log(`[TTS] Trying model: ${model}`)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `以下のテキストを読み上げてください:\n\n${truncatedText}` }]
            }
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' }
              }
            }
          }
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[TTS] ${model} failed ${response.status}:`, errorText.slice(0, 200))
        continue
      }
      
      const data = await response.json()
      const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
      
      if (audioData) {
        console.log(`[TTS] Success with ${model}, audio length: ${audioData.length}`)
        return NextResponse.json({ audio: audioData })
      }
    }
    
    return NextResponse.json({ error: 'All TTS models failed' }, { status: 500 })
  } catch (error: any) {
    console.error('[TTS] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
