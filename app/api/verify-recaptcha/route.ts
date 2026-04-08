import { NextRequest, NextResponse } from 'next/server'

// Edge Runtimeで軽量化
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, error: 'トークンが必要です' }, { status: 400 })
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not set')
      return NextResponse.json({ success: false, error: 'サーバー設定エラー' }, { status: 500 })
    }

    // Google reCAPTCHA v3 APIで検証
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`
    
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`
    })

    const data = await response.json()

    // スコア閾値（新しいサイトはスコアが低い傾向があるため、0.1に設定）
    // Googleがサイトの信頼性を学習するまで低めに設定
    const minScore = 0.1

    console.log('[reCAPTCHA] Verification response:', {
      success: data.success,
      score: data.score,
      hostname: data.hostname,
      errorCodes: data['error-codes']
    })

    // v3ではスコアをチェック（0.0-1.0、開発環境は0.3以上、本番は0.5以上を人間と判定）
    if (data.success && data.score >= minScore) {
      return NextResponse.json({ 
        success: true, 
        score: data.score,
        hostname: data.hostname
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'reCAPTCHA検証に失敗しました',
        score: data.score,
        hostname: data.hostname,
        errorCodes: data['error-codes'],
        minScore
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('reCAPTCHA verification error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
