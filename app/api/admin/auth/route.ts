import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    const validUsername = process.env.ADMIN_USERNAME
    const validPassword = process.env.ADMIN_PASSWORD
    
    if (username === validUsername && password === validPassword) {
      // セッショントークン生成
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')
      
      const cookieStore = await cookies()
      cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24時間
      })
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_token')
  return NextResponse.json({ success: true })
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')
  return NextResponse.json({ authenticated: !!token })
}
