import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ searches: [] })
  }

  try {
    // search_queriesテーブルから関連検索を取得
    const { data, error } = await supabase
      .from('search_queries')
      .select('query')
      .ilike('query', `%${query}%`)
      .neq('query', query) // 現在の検索クエリは除外
      .order('search_count', { ascending: false })
      .limit(8)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ searches: [] })
    }

    const searches = (data || []).map(row => row.query)

    return NextResponse.json({ searches }, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600' }
    })
  } catch (error) {
    console.error('Related searches error:', error)
    return NextResponse.json({ searches: [] })
  }
}
