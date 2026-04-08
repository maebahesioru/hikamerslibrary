import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/postgres'

// マテリアライズドビューをリフレッシュ
export async function POST(request: NextRequest) {
  // 簡易認証（本番では適切な認証を）
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = getPool()
    const start = Date.now()
    await client.query('REFRESH MATERIALIZED VIEW hikamer_stats')
    const elapsed = Date.now() - start
    
    const result = await client.query('SELECT COUNT(*) FROM hikamer_stats')
    const count = result.rows[0].count

    return NextResponse.json({ 
      success: true, 
      message: `Refreshed in ${elapsed}ms`,
      userCount: parseInt(count)
    })
  } catch (error: any) {
    console.error('[Hikamer Refresh] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
