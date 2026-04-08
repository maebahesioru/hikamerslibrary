'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './Breakout.module.css'

export default function Breakout() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const gameStateRef = useRef({
    ballX: 240,
    ballY: 300,
    ballDX: 3,
    ballDY: -3,
    paddleX: 210,
    bricks: [] as boolean[][]
  })

  useEffect(() => {
    initGame()
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const draw = () => {
      if (!ctx || !canvas) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const state = gameStateRef.current

      // Draw ball
      ctx.beginPath()
      ctx.arc(state.ballX, state.ballY, 8, 0, Math.PI * 2)
      ctx.fillStyle = '#4285f4'
      ctx.fill()
      ctx.closePath()

      // Draw paddle
      ctx.fillStyle = '#34a853'
      ctx.fillRect(state.paddleX, 380, 80, 10)

      // Draw bricks
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 8; c++) {
          if (state.bricks[r][c]) {
            const colors = ['#ea4335', '#fbbc04', '#34a853', '#4285f4', '#9334e6']
            ctx.fillStyle = colors[r]
            ctx.fillRect(c * 60 + 5, r * 20 + 30, 50, 15)
          }
        }
      }

      // Update ball position
      if (!gameOver && !won) {
        state.ballX += state.ballDX
        state.ballY += state.ballDY

        // Wall collision
        if (state.ballX < 8 || state.ballX > canvas.width - 8) {
          state.ballDX = -state.ballDX
        }
        if (state.ballY < 8) {
          state.ballDY = -state.ballDY
        }

        // Paddle collision
        if (state.ballY > 370 && state.ballY < 390 &&
            state.ballX > state.paddleX && state.ballX < state.paddleX + 80) {
          state.ballDY = -state.ballDY
        }

        // Bottom collision
        if (state.ballY > canvas.height) {
          setGameOver(true)
        }

        // Brick collision
        const ballRow = Math.floor((state.ballY - 30) / 20)
        const ballCol = Math.floor((state.ballX - 5) / 60)
        if (ballRow >= 0 && ballRow < 5 && ballCol >= 0 && ballCol < 8) {
          if (state.bricks[ballRow][ballCol]) {
            state.bricks[ballRow][ballCol] = false
            state.ballDY = -state.ballDY
            setScore(s => s + 10)
            
            // Check win
            if (state.bricks.every(row => row.every(brick => !brick))) {
              setWon(true)
            }
          }
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      gameStateRef.current.paddleX = Math.max(0, Math.min(mouseX - 40, canvas.width - 80))
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    animationId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [gameOver, won])

  const initGame = () => {
    const bricks: boolean[][] = []
    for (let r = 0; r < 5; r++) {
      bricks[r] = []
      for (let c = 0; c < 8; c++) {
        bricks[r][c] = true
      }
    }
    gameStateRef.current = {
      ballX: 240,
      ballY: 300,
      ballDX: 3,
      ballDY: -3,
      paddleX: 210,
      bricks
    }
    setScore(0)
    setGameOver(false)
    setWon(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>ブロック崩し</h2>
        <div className={styles.score}>スコア: {score}</div>
        <button type="button" onClick={initGame} className={styles.resetBtn}>新しいゲーム</button>
      </div>
      {gameOver && <div className={styles.message}>ゲームオーバー！</div>}
      {won && <div className={styles.message}>クリア！</div>}
      <canvas ref={canvasRef} width={480} height={400} className={styles.canvas} />
    </div>
  )
}
