import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // 人気の検索クエリを取得（検索回数の多い順）
    const { data, error } = await supabase
      .from('search_queries')
      .select('query, search_count')
      .order('search_count', { ascending: false })
      .limit(Math.min(limit, 100))

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ suggestions: [] }, { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        }
      })
    }

    return NextResponse.json({ suggestions: data || [] }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      }
    })
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return NextResponse.json({ suggestions: [] }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
    }

    // 検索クエリを記録または更新
    const { data: existing } = await supabase
      .from('search_queries')
      .select('id, search_count')
      .eq('query', query)
      .single()

    if (existing) {
      // 既存のクエリの検索回数を増やす
      await supabase
        .from('search_queries')
        .update({ search_count: existing.search_count + 1, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      // 新しいクエリを追加
      await supabase
        .from('search_queries')
        .insert({ query, search_count: 1 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording search:', error)
    return NextResponse.json({ error: 'Failed to record search' }, { status: 500 })
  }
}
