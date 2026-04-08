export async function verifyRecaptcha(
  executeRecaptcha: (action: string) => Promise<string | null>,
  action: string
): Promise<boolean> {
  // localhost環境ではreCAPTCHAをスキップ
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname === '[::1]')

  if (isLocalhost) {
    console.log('[reCAPTCHA] Localhost detected, skipping verification...')
    return true
  }

  // セッションストレージで検証済みクエリをチェック（URL検索の場合のみ）
  if (action === 'search_url') {
    const verifiedQueries = sessionStorage.getItem('verified_queries')
    const verifiedList = verifiedQueries ? JSON.parse(verifiedQueries) : []
    
    // 既に検証済みのクエリならスキップ
    const currentQuery = new URLSearchParams(window.location.search).get('q')
    if (currentQuery && verifiedList.includes(currentQuery)) {
      console.log('[reCAPTCHA] Query already verified, skipping...')
      return true
    }
  }

  console.log('[reCAPTCHA] Starting verification...')

  // reCAPTCHA v3トークンを取得
  const token = await executeRecaptcha(action)
  
  console.log('[reCAPTCHA] Token received:', token ? 'Yes' : 'No')
  
  // トークンがskipの場合は検証をスキップ（環境変数未設定の開発環境のみ）
  if (token === 'skip') {
    console.log('[reCAPTCHA] Verification skipped (development mode)')
    return true
  }
  
  if (!token) {
    return false
  }

  // トークンを検証
  try {
    console.log('[reCAPTCHA] Verifying token...')
    const response = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })

    const data = await response.json()
    console.log('[reCAPTCHA] Verification result:', data)

    if (!data.success) {
      console.error('[reCAPTCHA] Verification failed:', data.errorCodes)
      alert(`ボットの可能性があると判定されました。\nエラー: ${data.errorCodes?.join(', ') || data.error}`)
      return false
    }

    // 検証成功、クエリをリストに追加（URL検索の場合のみ）
    if (action === 'search_url') {
      const currentQuery = new URLSearchParams(window.location.search).get('q')
      if (currentQuery) {
        const verifiedQueries = sessionStorage.getItem('verified_queries')
        const verifiedList = verifiedQueries ? JSON.parse(verifiedQueries) : []
        verifiedList.push(currentQuery)
        sessionStorage.setItem('verified_queries', JSON.stringify(verifiedList))
      }
    }
    
    return true
  } catch (error) {
    console.error('[reCAPTCHA] Verification error:', error)
    alert('セキュリティ検証中にエラーが発生しました。')
    return false
  }
}
