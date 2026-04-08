import { NextRequest, NextResponse } from 'next/server'

// Edge Runtimeで軽量化
export async function POST(request: NextRequest) {
  try {
    // ログは省略（本番では外部サービスに送信する場合のみ有効化）
    // const data = await request.json()
    // console.log('[Web Vitals]', data)
    
    return new Response('{"success":true}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch {
    return new Response('{"error":"Invalid"}', { status: 400 })
  }
}
