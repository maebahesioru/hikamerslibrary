'use client'

import { useState, useEffect } from 'react'
import styles from './PaddingtonToast.module.css'

interface PaddingtonToastProps {
  onClose: () => void
}

export default function PaddingtonToast({ onClose }: PaddingtonToastProps) {
  const [toasts, setToasts] = useState<{ id: number; x: number; y: number; delay: number }[]>([])
  const [nextId, setNextId] = useState(0)

  useEffect(() => {
    // 5秒間、画面全体にパンを生成
    const duration = 5000 // 5秒
    const interval = 50 // 50msごとに生成（より多く）
    const totalToasts = duration / interval

    let count = 0
    const fountainInterval = setInterval(() => {
      if (count >= totalToasts) {
        clearInterval(fountainInterval)
        // 5秒後に自動的に閉じる
        setTimeout(() => {
          onClose()
        }, 2000)
        return
      }

      // 画面全体にランダムにパンを配置
      // 複数のパンを同時に生成
      for (let i = 0; i < 3; i++) {
        const x = Math.random() * window.innerWidth
        const y = Math.random() * window.innerHeight

        const newToast = { 
          id: nextId + count * 3 + i, 
          x, 
          y,
          delay: count * interval
        }
        
        setToasts(prev => [...prev, newToast])

        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newToast.id))
        }, 2000)
      }

      count++
    }, interval)

    return () => clearInterval(fountainInterval)
  }, [nextId, onClose])

  return (
    <div className={styles.paddingtonContainer}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={styles.flyingToast}
          style={{
            left: `${toast.x}px`,
            top: `${toast.y}px`
          }}
        >
          🍞
        </div>
      ))}
    </div>
  )
}
