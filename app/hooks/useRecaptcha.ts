'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    grecaptcha: any
    recaptchaLoadPromise?: Promise<void>
  }
}

export function useRecaptcha() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // reCAPTCHA v3スクリプトを読み込む
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    
    if (!siteKey) {
      console.warn('[useRecaptcha] NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set - reCAPTCHA disabled')
      setIsLoaded(true) // 環境変数がない場合はスキップ
      return
    }

    // 既にスクリプトが読み込まれているかチェック
    const existingScript = document.querySelector(`script[src*="recaptcha"]`)
    if (existingScript && window.grecaptcha) {
      setIsLoaded(true)
      return
    }

    // 既に読み込み中の場合は待機
    if (window.recaptchaLoadPromise) {
      window.recaptchaLoadPromise.then(() => setIsLoaded(true))
      return
    }

    // 読み込みPromiseを作成
    window.recaptchaLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        // grecaptcha.readyを待つ
        if (window.grecaptcha && window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            setIsLoaded(true)
            resolve()
          })
        } else {
          setIsLoaded(true)
          resolve()
        }
      }

      script.onerror = () => {
        console.error('[useRecaptcha] Failed to load reCAPTCHA script')
        reject(new Error('Failed to load reCAPTCHA'))
      }

      document.head.appendChild(script)
    })

    window.recaptchaLoadPromise.catch(() => {
      setIsLoaded(true) // エラーでもスキップ
    })
  }, [])

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    
    // 環境変数がない場合のみスキップ（開発環境用）
    if (!siteKey) {
      console.warn('[useRecaptcha] NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set - skipping verification')
      return 'skip'
    }

    try {
      // 読み込みPromiseを待つ（最大10秒）
      if (window.recaptchaLoadPromise) {
        await Promise.race([
          window.recaptchaLoadPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
        ])
      }

      // reCAPTCHAが利用可能かチェック
      if (!window.grecaptcha || !window.grecaptcha.execute) {
        console.error('[useRecaptcha] reCAPTCHA not loaded after timeout')
        return null // 読み込み失敗の場合はnullを返す
      }

      // grecaptcha.readyを使用して確実に準備完了を待つ
      return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn('[useRecaptcha] reCAPTCHA execution timeout - skipping verification')
          resolve('skip') // タイムアウト時はスキップして続行
        }, 10000)

        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(siteKey, { action })
            clearTimeout(timeout)
            resolve(token)
          } catch (error) {
            clearTimeout(timeout)
            console.error('[useRecaptcha] reCAPTCHA execution error:', error)
            resolve('skip') // エラー時もスキップして続行
          }
        })
      })
    } catch (error) {
      console.error('[useRecaptcha] reCAPTCHA error:', error)
      return 'skip' // エラーの場合はスキップして続行
    }
  }

  return { isLoaded, executeRecaptcha }
}
