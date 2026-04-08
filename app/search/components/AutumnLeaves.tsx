'use client'

import { useEffect } from 'react'
import styles from './AutumnLeaves.module.css'

interface AutumnLeavesProps {
  onClose: () => void
}

export default function AutumnLeaves({ onClose }: AutumnLeavesProps) {
  const leafColors = ['#ff6b35', '#f7931e', '#fdc82f', '#c1272d', '#8b4513']
  
  return (
    <div className={styles.autumnContainer}>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="紅葉エフェクトを閉じる"
      >
        ✕
      </button>
      {[...Array(25)].map((_, i) => {
        const leafType = Math.floor(Math.random() * 3)
        return (
          <div
            key={i}
            className={`${styles.leaf} ${styles[`leafType${leafType}`]}`}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
              background: leafColors[Math.floor(Math.random() * leafColors.length)]
            }}
          />
        )
      })}
    </div>
  )
}
