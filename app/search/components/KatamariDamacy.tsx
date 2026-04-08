'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './KatamariDamacy.module.css'

interface SearchResult {
  id: string
  text: string
  element: HTMLElement
}

interface KatamariDamacyProps {
  onClose: () => void
}

export default function KatamariDamacy({ onClose }: KatamariDamacyProps) {
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const [size, setSize] = useState(50)
  const [rotation, setRotation] = useState(0)
  const [collectedItems, setCollectedItems] = useState<SearchResult[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const ballRef = useRef<HTMLDivElement>(null)
  const lastPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (ballRef.current?.contains(e.target as Node)) {
        setIsDragging(true)
        lastPosRef.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const dx = e.clientX - lastPosRef.current.x
      const dy = e.clientY - lastPosRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      setPosition(prev => ({
        x: Math.max(size / 2, Math.min(window.innerWidth - size / 2, prev.x + dx)),
        y: Math.max(size / 2, Math.min(window.innerHeight - size / 2, prev.y + dy))
      }))

      setRotation(prev => prev + distance * 2)
      lastPosRef.current = { x: e.clientX, y: e.clientY }

      // 検索結果との衝突判定
      checkCollisions()
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (ballRef.current?.contains(e.target as Node)) {
        setIsDragging(true)
        lastPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      e.preventDefault()

      const touch = e.touches[0]
      const dx = touch.clientX - lastPosRef.current.x
      const dy = touch.clientY - lastPosRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      setPosition(prev => ({
        x: Math.max(size / 2, Math.min(window.innerWidth - size / 2, prev.x + dx)),
        y: Math.max(size / 2, Math.min(window.innerHeight - size / 2, prev.y + dy))
      }))

      setRotation(prev => prev + distance * 2)
      lastPosRef.current = { x: touch.clientX, y: touch.clientY }

      checkCollisions()
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, size])

  const checkCollisions = () => {
    const searchResults = document.querySelectorAll('[data-tweet-id]')
    
    searchResults.forEach((element) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const distance = Math.sqrt(
        Math.pow(centerX - position.x, 2) + 
        Math.pow(centerY - position.y, 2)
      )

      if (distance < size / 2 + 50 && !collectedItems.find(item => item.id === element.getAttribute('data-tweet-id'))) {
        const tweetId = element.getAttribute('data-tweet-id') || ''
        const text = element.textContent?.substring(0, 50) || ''
        
        setCollectedItems(prev => [...prev, { 
          id: tweetId, 
          text, 
          element: element as HTMLElement 
        }])
        
        setSize(prev => prev + 5)
        
        // 要素を非表示にする
        ;(element as HTMLElement).style.opacity = '0.3'
        ;(element as HTMLElement).style.pointerEvents = 'none'
      }
    })
  }

  return (
    <>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="塊魂を閉じる"
      >
        ✕
      </button>
      <div className={styles.instructions}>
        🎮 球体をドラッグして検索結果を巻き込もう！
      </div>
      <div
        ref={ballRef}
        className={styles.katamari}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size}px`,
          height: `${size}px`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div className={styles.spikes}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={styles.spike}
              style={{
                transform: `rotate(${(360 / 20) * i}deg) translateY(-${size / 2}px)`
              }}
            />
          ))}
        </div>
        <div className={styles.counter}>
          {collectedItems.length}
        </div>
      </div>
    </>
  )
}
