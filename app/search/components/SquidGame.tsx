'use client'

import { useState, useEffect } from 'react'
import styles from './SquidGame.module.css'

interface SquidGameProps {
  onClose: () => void
}

export default function SquidGame({ onClose }: SquidGameProps) {
  const [showInvitation, setShowInvitation] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [playerPosition, setPlayerPosition] = useState(50)
  const [dollLooking, setDollLooking] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  useEffect(() => {
    if (!gameStarted) return

    // だるまさんがころんだのタイミング
    const interval = setInterval(() => {
      setDollLooking(true)
      setTimeout(() => setDollLooking(false), 2000)
    }, 5000)

    return () => clearInterval(interval)
  }, [gameStarted])

  useEffect(() => {
    if (!gameStarted) return

    // 人形が見ている時に動いていたらゲームオーバー
    if (dollLooking && isMoving) {
      setGameOver(true)
      setGameStarted(false)
    }

    // ゴールに到達
    if (playerPosition >= 90) {
      setWon(true)
      setGameStarted(false)
    }
  }, [dollLooking, isMoving, playerPosition, gameStarted])

  const startGame = () => {
    setShowInvitation(false)
    setGameStarted(true)
    setPlayerPosition(10)
    setGameOver(false)
    setWon(false)
  }

  const handleMouseDown = () => {
    if (!gameStarted) return
    setIsMoving(true)
  }

  const handleMouseUp = () => {
    setIsMoving(false)
  }

  useEffect(() => {
    if (!gameStarted) return

    const interval = setInterval(() => {
      if (isMoving && !dollLooking) {
        setPlayerPosition(prev => Math.min(prev + 1, 100))
      }
    }, 50)

    return () => clearInterval(interval)
  }, [isMoving, dollLooking, gameStarted])

  return (
    <div className={styles.squidGameContainer}>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="イカゲームを閉じる"
      >
        ✕
      </button>
      {showInvitation && (
        <div className={styles.invitation} onClick={startGame}>
          <div className={styles.card}>
            <div className={styles.shapes}>
              <div className={styles.triangle}>▲</div>
              <div className={styles.circle}>●</div>
              <div className={styles.square}>■</div>
            </div>
            <p>イカゲームへの招待</p>
            <p className={styles.small}>クリックして参加</p>
          </div>
        </div>
      )}

      {gameStarted && (
        <div className={styles.gameArea}>
          <div className={styles.doll}>
            <div className={`${styles.dollFace} ${dollLooking ? styles.dollLooking : ''}`}>
              {dollLooking ? '👀' : '🙈'}
            </div>
            <div className={styles.status}>
              {dollLooking ? '見てる！' : '動いて！'}
            </div>
          </div>
          <div className={styles.track}>
            <div className={styles.startLine}>スタート</div>
            <div 
              className={styles.player}
              style={{ left: `${playerPosition}%` }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
            >
              🏃
            </div>
            <div className={styles.finishLine}>ゴール</div>
          </div>
          <div className={styles.instructions}>
            マウスを押し続けて前進！人形が見ている時は止まれ！
          </div>
        </div>
      )}

      {gameOver && (
        <div className={styles.gameOverScreen}>
          <div className={styles.gameOverText}>💀 ゲームオーバー</div>
          <button className={styles.retryButton} onClick={startGame}>
            もう一度挑戦
          </button>
        </div>
      )}

      {won && (
        <div className={styles.winScreen}>
          <div className={styles.winText}>🎉 クリア！</div>
          <button className={styles.retryButton} onClick={startGame}>
            もう一度遊ぶ
          </button>
        </div>
      )}
    </div>
  )
}
