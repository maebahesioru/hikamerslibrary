'use client'

import { useState, useEffect } from 'react'
import styles from './SolarEclipse.module.css'

interface SolarEclipseProps {
  onClose: () => void
}

export default function SolarEclipse({ onClose }: SolarEclipseProps) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    // 日食のフェーズを自動的に進める
    const interval = setInterval(() => {
      setPhase(prev => (prev + 1) % 5)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getEclipsePhase = () => {
    switch (phase) {
      case 0: return { name: '部分日食（開始）', position: '20%' }
      case 1: return { name: '部分日食（進行中）', position: '35%' }
      case 2: return { name: '皆既日食', position: '50%' }
      case 3: return { name: '部分日食（終了中）', position: '65%' }
      case 4: return { name: '部分日食（終了）', position: '80%' }
      default: return { name: '部分日食', position: '50%' }
    }
  }

  const currentPhase = getEclipsePhase()

  return (
    <div className={styles.eclipseContainer}>
      <div className={styles.instructions}>
        🌑 {currentPhase.name}
      </div>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="日食エフェクトを閉じる"
      >
        ✕
      </button>
      <div className={styles.sky}>
        <div className={styles.sun}>
          <div className={styles.corona} />
        </div>
        <div 
          className={styles.moon}
          style={{ left: currentPhase.position }}
        />
        <div className={styles.stars}>
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={styles.star}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: phase === 2 ? 0.8 : 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
