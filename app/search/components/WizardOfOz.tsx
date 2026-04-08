'use client'

import { useState } from 'react'
import styles from './WizardOfOz.module.css'

interface WizardOfOzProps {
  onClose: () => void
}

export default function WizardOfOz({ onClose }: WizardOfOzProps) {
  const [isGrayscale, setIsGrayscale] = useState(false)
  const [showHouse, setShowHouse] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)

  const handleShoeClick = () => {
    if (!isGrayscale) {
      // 最初のクリック：回転して白黒に
      setIsSpinning(true)
      setTimeout(() => {
        setIsGrayscale(true)
        setIsSpinning(false)
      }, 1000)
    } else {
      // 2回目のクリック：家が出て元に戻る
      setShowHouse(true)
      setTimeout(() => {
        setIsGrayscale(false)
        setShowHouse(false)
      }, 2000)
    }
  }

  return (
    <>
      <div className={`${styles.overlay} ${isGrayscale ? styles.grayscale : ''} ${isSpinning ? styles.spinning : ''}`} />
      <div className={styles.wizardContainer}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="オズの魔法使いを閉じる"
        >
          ✕
        </button>
        <div className={styles.shoe} onClick={handleShoeClick}>
          👠
        </div>
        {showHouse && (
          <div className={styles.house}>
            🏠
          </div>
        )}
      </div>
    </>
  )
}
