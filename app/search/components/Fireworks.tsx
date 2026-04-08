'use client'

import { useState, useEffect } from 'react'
import styles from './Fireworks.module.css'

interface Firework {
  id: number
  x: number
  y: number
  color: string
  particles: Particle[]
}

interface Particle {
  angle: number
  speed: number
}

interface FireworksProps {
  onClose: () => void
}

export default function Fireworks({ onClose }: FireworksProps) {
  const [fireworks, setFireworks] = useState<Firework[]>([])
  const [nextId, setNextId] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#ff0088']
      const particles: Particle[] = []
      
      for (let i = 0; i < 30; i++) {
        particles.push({
          angle: (360 / 30) * i,
          speed: 2 + Math.random() * 2
        })
      }

      const newFirework: Firework = {
        id: nextId,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        particles
      }

      setFireworks(prev => [...prev, newFirework])
      setNextId(prev => prev + 1)

      setTimeout(() => {
        setFireworks(prev => prev.filter(f => f.id !== newFirework.id))
      }, 2000)
    }, 800)

    return () => clearInterval(interval)
  }, [nextId])

  return (
    <div className={styles.fireworksContainer}>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="花火を閉じる"
      >
        ✕
      </button>
      {fireworks.map(firework => (
        <div
          key={firework.id}
          className={styles.firework}
          style={{
            left: `${firework.x}%`,
            top: `${firework.y}%`
          }}
        >
          {firework.particles.map((particle, i) => (
            <div
              key={i}
              className={styles.particle}
              style={{
                background: firework.color,
                '--angle': `${particle.angle}deg`,
                '--distance': `${particle.speed * 50}px`
              } as React.CSSProperties}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
