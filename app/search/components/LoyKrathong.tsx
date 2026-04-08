'use client'

import { useState, useEffect } from 'react'
import styles from './LoyKrathong.module.css'

interface Lantern {
  id: number
  x: number
  delay: number
}

export default function LoyKrathong() {
  const [lanterns, setLanterns] = useState<Lantern[]>([])
  const [nextId, setNextId] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const newLantern: Lantern = {
        id: nextId,
        x: 10 + Math.random() * 80,
        delay: Math.random() * 2
      }
      setLanterns(prev => [...prev, newLantern])
      setNextId(prev => prev + 1)

      setTimeout(() => {
        setLanterns(prev => prev.filter(l => l.id !== newLantern.id))
      }, 15000)
    }, 1000)

    return () => clearInterval(interval)
  }, [nextId])

  return (
    <div className={styles.loyKrathongContainer}>
      {lanterns.map(lantern => (
        <div
          key={lantern.id}
          className={styles.lantern}
          style={{
            left: `${lantern.x}%`,
            animationDelay: `${lantern.delay}s`
          }}
        >
          🏮
        </div>
      ))}
    </div>
  )
}
