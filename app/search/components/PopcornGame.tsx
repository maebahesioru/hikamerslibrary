'use client'

import { useState, useEffect } from 'react'
import styles from './PopcornGame.module.css'

interface Popcorn {
  id: number
  x: number
  y: number
  popped: boolean
  falling: boolean
}

interface PopcornGameProps {
  onClose: () => void
}

export default function PopcornGame({ onClose }: PopcornGameProps) {
  const [popcorns, setPopcorns] = useState<Popcorn[]>([])
  const [score, setScore] = useState(0)
  const [nextId, setNextId] = useState(0)

  useEffect(() => {
    // ポップコーンを生成
    const generatePopcorn = () => {
      const newPopcorn: Popcorn = {
        id: nextId,
        x: 20 + Math.random() * 60,
        y: 80,
        popped: false,
        falling: false
      }
      setPopcorns(prev => [...prev, newPopcorn])
      setNextId(prev => prev + 1)

      // 自動的にポップ
      setTimeout(() => {
        setPopcorns(prev => prev.map(p => 
          p.id === newPopcorn.id ? { ...p, popped: true } : p
        ))
      }, 500)

      // 落下開始
      setTimeout(() => {
        setPopcorns(prev => prev.map(p => 
          p.id === newPopcorn.id ? { ...p, falling: true } : p
        ))
      }, 1000)

      // 削除
      setTimeout(() => {
        setPopcorns(prev => prev.filter(p => p.id !== newPopcorn.id))
      }, 4000)
    }

    const interval = setInterval(generatePopcorn, 800)
    return () => clearInterval(interval)
  }, [nextId])

  const handlePopcornClick = (id: number) => {
    const popcorn = popcorns.find(p => p.id === id)
    if (popcorn && popcorn.popped && !popcorn.falling) {
      setScore(prev => prev + 10)
      setPopcorns(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <div className={styles.popcornContainer}>
      <div className={styles.scoreBoard}>
        🍿 スコア: {score}
      </div>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="ポップコーンゲームを閉じる"
      >
        ✕
      </button>
      <div className={styles.instructions}>
        ポップコーンをクリックしてキャッチ！
      </div>
      {popcorns.map(popcorn => (
        <div
          key={popcorn.id}
          className={`${styles.popcorn} ${popcorn.popped ? styles.popped : ''} ${popcorn.falling ? styles.falling : ''}`}
          style={{
            left: `${popcorn.x}%`,
            bottom: popcorn.falling ? '-10%' : `${popcorn.y}%`
          }}
          onClick={() => handlePopcornClick(popcorn.id)}
        >
          {popcorn.popped ? '🍿' : '🌽'}
        </div>
      ))}
    </div>
  )
}
