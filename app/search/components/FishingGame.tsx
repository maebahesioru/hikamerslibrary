'use client'

import { useState } from 'react'
import styles from './FishingGame.module.css'

export default function FishingGame() {
  const [isFishing, setIsFishing] = useState(false)
  const [caught, setCaught] = useState<string | null>(null)
  const [score, setScore] = useState(0)

  const items = [
    { emoji: '🐟', name: '魚', points: 10 },
    { emoji: '🥫', name: '魚の缶詰', points: 15 },
    { emoji: '🥾', name: '靴', points: -5 },
    { emoji: '🥫', name: '空き缶', points: -5 }
  ]

  const handleFish = () => {
    if (isFishing) return

    setIsFishing(true)
    setCaught(null)

    setTimeout(() => {
      const item = items[Math.floor(Math.random() * items.length)]
      setCaught(item.emoji)
      setScore(prev => prev + item.points)
      setIsFishing(false)
    }, 2000)
  }

  return (
    <div className={styles.fishingContainer}>
      <div className={styles.monster}>
        <div className={styles.monsterFace}>👹</div>
        <div className={`${styles.fishingRod} ${isFishing ? styles.casting : ''}`}>
          🎣
        </div>
      </div>
      <div className={styles.water}>
        🌊🌊🌊🌊🌊
      </div>
      {caught && (
        <div className={styles.caught}>
          <div className={styles.caughtItem}>{caught}</div>
        </div>
      )}
      <div className={styles.controls}>
        <div className={styles.score}>スコア: {score}</div>
        <button 
          className={styles.fishButton} 
          onClick={handleFish}
          disabled={isFishing}
        >
          {isFishing ? '釣り中...' : '🎣 釣りをする'}
        </button>
        <div className={styles.hint}>
          クリックして釣りをしよう！
        </div>
      </div>
    </div>
  )
}
