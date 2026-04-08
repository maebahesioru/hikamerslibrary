'use client'

import { useEffect } from 'react'

// Web Vitals の型定義
interface Metric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

// サンプリングレート（10%のユーザーのみ送信）
const SAMPLING_RATE = 0.1

export function WebVitals() {
  useEffect(() => {
    // サンプリング: 10%のユーザーのみ送信
    if (Math.random() > SAMPLING_RATE) return
    
    // web-vitals ライブラリを動的インポート
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      const reportMetric = (metric: Metric) => {
        // コンソールに出力（開発時）
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric.rating)
        }
        
        // Analytics に送信（本番環境、LCPのみ）
        if (typeof window !== 'undefined' && 'sendBeacon' in navigator && metric.name === 'LCP') {
          const body = JSON.stringify({
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
            page: window.location.pathname,
            timestamp: Date.now()
          })
          
          navigator.sendBeacon('/api/vitals', body)
        }
      }

      onCLS(reportMetric)  // Cumulative Layout Shift
      onFCP(reportMetric)  // First Contentful Paint
      onLCP(reportMetric)  // Largest Contentful Paint
      onTTFB(reportMetric) // Time to First Byte
      onINP(reportMetric)  // Interaction to Next Paint
    }).catch(() => {
      // web-vitals がない場合は無視
    })
  }, [])

  return null
}
