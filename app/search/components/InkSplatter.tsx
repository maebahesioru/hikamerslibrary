'use client'

import { useState, useEffect } from 'react'
import styles from './InkSplatter.module.css'

interface Splatter {
  id: number
  x: number
  y: number
  color: string
  size: number
}

interface InkSplatterProps {
  type: 'splatoon' | 'holi'
  onClose: () => void
}

export default function InkSplatter({ type, onClose }: InkSplatterProps) {
  const [splatters, setSplatters] = useState<Splatter[]>([])
  const [nextId, setNextId] = useState(0)

  const colors = type === 'splatoon' 
    ? ['#ff4500', '#00ff00', '#ff1493', '#00ffff', '#ffff00', '#ff00ff']
    : ['#ff1744', '#ff9100', '#ffea00', '#00e676', '#00b0ff', '#d500f9', '#ff4081']

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const newSplatter: Splatter = {
        id: nextId,
        x: e.clientX,
        y: e.clientY,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 50 + Math.random() * 100
      }

      setSplatters(prev => [...prev, newSplatter])
      setNextId(prev => prev + 1)

      // 5秒後に削除
      setTimeout(() => {
        setSplatters(prev => prev.filter(s => s.id !== newSplatter.id))
      }, 5000)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [nextId, colors])

  return (
    <div className={styles.inkContainer}>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="インクエフェクトを閉じる"
      >
        ✕
      </button>
      <div className={styles.instructions}>
        {type === 'splatoon' ? '🎨 クリックしてインクを飛ばそう！' : '🎉 クリックして色粉を飛ばそう！'}
      </div>
      {splatters.map(splatter => (
        <div
          key={splatter.id}
          className={styles.splatter}
          style={{
            left: `${splatter.x}px`,
            top: `${splatter.y}px`,
            width: `${splatter.size}px`,
            height: `${splatter.size}px`,
            background: `radial-gradient(circle, ${splatter.color} 0%, ${splatter.color}88 50%, transparent 100%)`
          }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={styles.splatterDrop}
              style={{
                background: splatter.color,
                transform: `rotate(${(360 / 8) * i}deg) translateY(-${splatter.size / 2}px)`
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
