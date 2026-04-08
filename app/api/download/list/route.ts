import { NextResponse } from 'next/server'
import { getPool } from '@/lib/postgres'

export async function GET() {
  try {
    const pool = getPool()
    
    // 日付ごとのツイート数とデータサイズ（概算）を取得
    const result = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(LENGTH(display_text)) as text_size
      FROM tweets
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `)
    
    // 年ごとにグループ化
    const grouped: { [year: string]: { date: string; count: number; size: number }[] } = {}
    
    for (const row of result.rows) {
      const dateStr = row.date.toISOString().split('T')[0]
      const year = dateStr.substring(0, 4)
      const count = parseInt(row.count)
      // 概算サイズ: テキストサイズ + メタデータ（1行あたり約500バイト）
      const size = parseInt(row.text_size || 0) + count * 500
      
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year].push({ date: dateStr, count, size })
    }
    
    // 統計情報
    const totalFiles = result.rows.length
    const totalTweets = result.rows.reduce((sum, r) => sum + parseInt(r.count), 0)
    const totalSize = result.rows.reduce((sum, r) => sum + parseInt(r.text_size || 0) + parseInt(r.count) * 500, 0)
    const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a))
    
    return NextResponse.json({
      files: grouped,
      stats: {
        totalFiles,
        totalTweets,
        totalSize,
        years: years.length
      }
    })
  } catch (error: any) {
    console.error('[Download List] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
