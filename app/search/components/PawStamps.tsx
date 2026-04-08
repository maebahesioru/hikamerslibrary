'use client'

import { useState, useEffect } from 'react'
import styles from './PawStamps.module.css'

interface Paw {
  id: number
  x: number
  y: number
  rotation: number
  type: 'dog' | 'cat'
}

interface PawStampsProps {
  type: 'dog' | 'cat'
  onClose: () => void
}

export default function PawStamps({ type, onClose }: PawStampsProps) {
  const [paws, setPaws] = useState<Paw[]>([])
  const [nextId, setNextId] = useState(0)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const newPaw: Paw = {
        id: nextId,
        x: e.clientX,
        y: e.clientY,
        rotation: Math.random() * 360,
        type
      }

      setPaws(prev => [...prev, newPaw])
      setNextId(prev => prev + 1)

      // 5秒後に削除
      setTimeout(() => {
        setPaws(prev => prev.filter(p => p.id !== newPaw.id))
      }, 5000)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [nextId, type])

  return (
    <div className={styles.pawContainer}>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="肉球スタンプを閉じる"
      >
        ✕
      </button>
      {paws.map(paw => (
        <div
          key={paw.id}
          className={styles.paw}
          style={{
            left: `${paw.x}px`,
            top: `${paw.y}px`,
            transform: `translate(-50%, -50%) rotate(${paw.rotation}deg)`
          }}
        >
          <div className={styles.mainPad} />
          <div className={styles.toe1} />
          <div className={styles.toe2} />
          <div className={styles.toe3} />
          <div className={styles.toe4} />
        </div>
      ))}
    </div>
  )
}
