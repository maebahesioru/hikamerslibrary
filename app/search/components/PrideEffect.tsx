'use client'

import { useEffect } from 'react'
import styles from './PrideEffect.module.css'

interface PrideEffectProps {
  onClose: () => void
}

export default function PrideEffect({ onClose }: PrideEffectProps) {
  useEffect(() => {
    // 5秒後に自動的に閉じる
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])
  useEffect(() => {
    // ページ全体に虹色のグラデーションを適用
    const style = document.createElement('style')
    style.textContent = `
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          135deg,
          rgba(255, 0, 0, 0.1) 0%,
          rgba(255, 127, 0, 0.1) 16.66%,
          rgba(255, 255, 0, 0.1) 33.33%,
          rgba(0, 255, 0, 0.1) 50%,
          rgba(0, 0, 255, 0.1) 66.66%,
          rgba(75, 0, 130, 0.1) 83.33%,
          rgba(148, 0, 211, 0.1) 100%
        );
        pointer-events: none;
        z-index: 1;
        animation: prideShift 10s ease-in-out infinite;
      }

      @keyframes prideShift {
        0%, 100% {
          opacity: 0.3;
          filter: hue-rotate(0deg);
        }
        50% {
          opacity: 0.5;
          filter: hue-rotate(30deg);
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className={styles.prideContainer}>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="PRIDEエフェクトを閉じる"
      >
        ✕
      </button>
      <div className={styles.confetti}>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={styles.confettiPiece}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              background: `hsl(${Math.random() * 360}, 100%, 60%)`
            }}
          />
        ))}
      </div>
    </div>
  )
}
