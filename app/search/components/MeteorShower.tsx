'use client'

import { useEffect } from 'react'
import styles from './MeteorShower.module.css'

interface MeteorShowerProps {
  onClose: () => void
}

export default function MeteorShower({ onClose }: MeteorShowerProps) {
  useEffect(() => {
    // 背景を暗くする
    document.body.style.backgroundColor = '#0a0e27'
    document.body.style.transition = 'background-color 0.5s'

    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  return (
    <div className={styles.meteorShower}>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="流星群を閉じる"
      >
        ✕
      </button>
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className={styles.meteor}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${1 + Math.random() * 2}s`
          }}
        >
          <div className={styles.meteorTail} />
        </div>
      ))}
      <div className={styles.stars}>
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className={styles.star}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}
