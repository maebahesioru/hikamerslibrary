'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './SnakeGame.module.css'

interface Position {
  x: number
  y: number
}

const GRID_SIZE = 20
const CELL_SIZE = 20

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT')
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
    setFood(newFood)
  }, [])

  const startGame = () => {
    setSnake([{ x: 10, y: 10 }])
    setDirection('RIGHT')
    setGameOver(false)
    setScore(0)
    setGameStarted(true)
    generateFood()
  }

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP')
          break
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN')
          break
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT')
          break
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction, gameStarted, gameOver])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const moveSnake = () => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake]
        const head = { ...newSnake[0] }

        switch (direction) {
          case 'UP':
            head.y -= 1
            break
          case 'DOWN':
            head.y += 1
            break
          case 'LEFT':
            head.x -= 1
            break
          case 'RIGHT':
            head.x += 1
            break
        }

        // 壁との衝突チェック
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true)
          return prevSnake
        }

        // 自分自身との衝突チェック
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true)
          return prevSnake
        }

        newSnake.unshift(head)

        // 食べ物を食べたかチェック
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => prev + 10)
          generateFood()
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }

    const interval = setInterval(moveSnake, 150)
    return () => clearInterval(interval)
  }, [direction, food, gameStarted, gameOver, generateFood])

  return (
    <div className={styles.snakeGameContainer}>
      {!gameStarted ? (
        <div className={styles.startScreen}>
          <h2>🐍 ヘビゲーム</h2>
          <p>矢印キーで操作</p>
          <button className={styles.startButton} onClick={startGame}>
            ゲームスタート
          </button>
        </div>
      ) : (
        <div className={styles.gameArea}>
          <div className={styles.scoreBoard}>
            スコア: {score}
          </div>
          <div 
            className={styles.grid}
            style={{
              width: GRID_SIZE * CELL_SIZE,
              height: GRID_SIZE * CELL_SIZE
            }}
          >
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`${styles.snakeSegment} ${index === 0 ? styles.snakeHead : ''}`}
                style={{
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE
                }}
              />
            ))}
            <div
              className={styles.food}
              style={{
                left: food.x * CELL_SIZE,
                top: food.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE
              }}
            >
              🍎
            </div>
          </div>
          {gameOver && (
            <div className={styles.gameOverOverlay}>
              <h2>ゲームオーバー</h2>
              <p>スコア: {score}</p>
              <button className={styles.retryButton} onClick={startGame}>
                もう一度
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
