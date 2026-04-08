import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// インメモリストレージ（フォールバック）
const memoryStorage: any[] = []

export async function POST(request: Request) {
  try {
    const { query, response, rating, feedback, categories } = await request.json()
    
    console.log('[Feedback API] Received feedback:', { rating, categories })
    
    if (!query || !response || !rating) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const feedbackData = {
      query,
      response: response.substring(0, 1000), // 最初の1000文字のみ保存
      rating,
      feedback: feedback || null,
      categories: categories || null,
      created_at: new Date().toISOString()
    }

    // Supabaseが設定されている場合
    if (supabaseUrl && supabaseKey) {
      console.log('[Feedback API] Using Supabase')
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      const { error } = await supabase
        .from('ai_feedback')
        .insert(feedbackData)

      if (error) {
        console.error('[Feedback API] Supabase insert error:', error)
        return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
      }
      
      console.log('[Feedback API] Saved to Supabase successfully')
    } else {
      // フォールバック: インメモリストレージ
      console.log('[Feedback API] Using memory storage')
      memoryStorage.push(feedbackData)
      console.log('[Feedback API] Saved to memory storage successfully')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Feedback API] Error:', error)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}
