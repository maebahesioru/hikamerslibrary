'use client'

import { useState, useEffect } from 'react'
import styles from './TomatoFestival.module.css'

interface Tomato {
  id: number
  x: number
  y: number
  landingY: number
  rotation: number
  splat: boolean
}

interface TomatoFestivalProps {
  onClose: () => void
}

export default function TomatoFestival({ onClose }: TomatoFestivalProps) {
  const [tomatoes, setTomatoes] = useState<Tomato[]>([])
  const [nextId, setNextId] = useState(0)

  useEffect(() => {
    // ランダムにトマトを投げる
    const interval = setInterval(() => {
      const newTomato: Tomato = {
        id: nextId,
        x: Math.random() * window.innerWidth,
        y: -50,
        landingY: (0.5 + Math.random() * 0.3) * window.innerHeight,
        rotation: Math.random() * 360,
        splat: false
      }

      setTomatoes(prev => [...prev, newTomato])
      setNextId(prev => prev + 1)

      // トマトが着地してスプラッシュ
      setTimeout(() => {
        setTomatoes(prev => 
          prev.map(t => t.id === newTomato.id ? { ...t, splat: true } : t)
        )
      }, 1500)

      // トマトを削除
      setTimeout(() => {
        setTomatoes(prev => prev.filter(t => t.id !== newTomato.id))
      }, 4000)
    }, 500)

    return () => clearInterval(interval)
  }, [nextId])

  return (
    <div className={styles.tomatoContainer}>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="トマト祭りを閉じる"
      >
        ✕
      </button>
      {tomatoes.map(tomato => (
        <div key={tomato.id}>
          {!tomato.splat ? (
            <div
              className={styles.tomato}
              style={{
                left: `${tomato.x}px`,
                top: `${tomato.y}px`,
                transform: `rotate(${tomato.rotation}deg)`
              }}
            >
              🍅
            </div>
          ) : (
            <div
              className={styles.splat}
              style={{
                left: `${tomato.x}px`,
                top: `${tomato.landingY}px`
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
