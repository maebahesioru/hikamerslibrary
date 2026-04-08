import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Supabaseクライアントを初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// インメモリストレージ（Supabaseが設定されていない場合のフォールバック）
const memoryStorage = new Map<string, { 
  query: string
  response: string
  tweets?: any[]
  searchQueries?: string[]
  createdAt: number 
}>()

// 共有リンクを作成
export async function POST(request: Request) {
  try {
    const { query, response, tweets, searchQueries } = await request.json()
    
    console.log('[Share API POST] Received request')
    console.log('[Share API POST] Query:', query)
    console.log('[Share API POST] Response length:', response?.length)
    console.log('[Share API POST] Tweets count:', tweets?.length || 0)
    console.log('[Share API POST] Search queries:', searchQueries?.length || 0)
    
    if (!query || !response) {
      return NextResponse.json({ error: 'Query and response are required' }, { status: 400 })
    }

    // ランダムなIDを生成
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    console.log('[Share API POST] Generated ID:', id)

    // Supabaseが設定されている場合
    if (supabaseUrl && supabaseKey) {
      console.log('[Share API POST] Using Supabase')
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      const { error } = await supabase
        .from('shared_conversations')
        .insert({
          id,
          query,
          response,
          tweets: tweets || null,
          search_queries: searchQueries || null,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('[Share API POST] Supabase insert error:', error)
        return NextResponse.json({ error: 'Failed to save conversation' }, { status: 500 })
      }
      
      console.log('[Share API POST] Saved to Supabase successfully')
    } else {
      // フォールバック: インメモリストレージ
      console.log('[Share API POST] Using memory storage (Supabase not configured)')
      memoryStorage.set(id, {
        query,
        response,
        tweets,
        searchQueries,
        createdAt: Date.now()
      })
      console.log('[Share API POST] Saved to memory storage successfully')
    }

    return NextResponse.json({ id })
  } catch (error) {
    console.error('[Share API POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
  }
}

// 共有リンクから会話を取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('[Share API GET] Received request for ID:', id)

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Supabaseが設定されている場合
    if (supabaseUrl && supabaseKey) {
      console.log('[Share API GET] Using Supabase')
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data, error } = await supabase
        .from('shared_conversations')
        .select('query, response, tweets, search_queries')
        .eq('id', id)
        .single()

      if (error || !data) {
        console.error('[Share API GET] Supabase select error:', error)
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      console.log('[Share API GET] Found in Supabase')
      return NextResponse.json({
        query: data.query,
        response: data.response,
        tweets: data.tweets,
        searchQueries: data.search_queries
      }, {
        headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' }
      })
    } else {
      // フォールバック: インメモリストレージ
      console.log('[Share API GET] Using memory storage (Supabase not configured)')
      const conversation = memoryStorage.get(id)

      if (!conversation) {
        console.error('[Share API GET] Not found in memory storage')
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      console.log('[Share API GET] Found in memory storage')
      return NextResponse.json({
        query: conversation.query,
        response: conversation.response,
        tweets: conversation.tweets,
        searchQueries: conversation.searchQueries
      }, {
        headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' }
      })
    }
  } catch (error) {
    console.error('[Share API GET] Error:', error)
    return NextResponse.json({ error: 'Failed to get conversation' }, { status: 500 })
  }
}
