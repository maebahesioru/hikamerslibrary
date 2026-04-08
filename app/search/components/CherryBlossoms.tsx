'use client'

import { useEffect } from 'react'
import styles from './CherryBlossoms.module.css'

interface CherryBlossomsProps {
  onClose: () => void
}

export default function CherryBlossoms({ onClose }: CherryBlossomsProps) {
  return (
    <div className={styles.cherryContainer}>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="桜エフェクトを閉じる"
      >
        ✕
      </button>
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className={styles.petal}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
            opacity: 0.6 + Math.random() * 0.4
          }}
        />
      ))}
    </div>
  )
}
