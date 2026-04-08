'use client'

import { useState, useEffect } from 'react'
import styles from './PacmanGame.module.css'

interface Position {
  x: number
  y: number
}

interface Ghost extends Position {
  color: string
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
}

const GRID_WIDTH = 25
const GRID_HEIGHT = 15
const CELL_SIZE = 24

const GHOST_COLORS = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852']
const INITIAL_GHOST_POSITIONS: Position[] = [
  { x: 23, y: 1 },
  { x: 23, y: 13 },
  { x: 12, y: 7 },
  { x: 1, y: 13 }
]

// 壁の位置を定義
const WALLS: Position[] = [
  // 外枠
  ...Array.from({ length: GRID_WIDTH }, (_, x) => ({ x, y: 0 })),
  ...Array.from({ length: GRID_WIDTH }, (_, x) => ({ x, y: GRID_HEIGHT - 1 })),
  ...Array.from({ length: GRID_HEIGHT }, (_, y) => ({ x: 0, y })),
  ...Array.from({ length: GRID_HEIGHT }, (_, y) => ({ x: GRID_WIDTH - 1, y })),
  // 内部の壁
  { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
  { x: 3, y: 4 }, { x: 5, y: 4 },
  { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 },
  { x: 8, y: 3 }, { x: 9, y: 3 }, { x: 10, y: 3 },
  { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 10, y: 5 },
  { x: 15, y: 3 }, { x: 16, y: 3 }, { x: 17, y: 3 },
  { x: 15, y: 5 }, { x: 16, y: 5 }, { x: 17, y: 5 },
  { x: 20, y: 3 }, { x: 21, y: 3 }, { x: 22, y: 3 },
  { x: 20, y: 4 }, { x: 22, y: 4 },
  { x: 20, y: 5 }, { x: 21, y: 5 }, { x: 22, y: 5 },
  { x: 3, y: 9 }, { x: 4, y: 9 }, { x: 5, y: 9 },
  { x: 3, y: 10 }, { x: 5, y: 10 },
  { x: 3, y: 11 }, { x: 4, y: 11 }, { x: 5, y: 11 },
  { x: 8, y: 9 }, { x: 9, y: 9 }, { x: 10, y: 9 },
  { x: 8, y: 11 }, { x: 9, y: 11 }, { x: 10, y: 11 },
  { x: 15, y: 9 }, { x: 16, y: 9 }, { x: 17, y: 9 },
  { x: 15, y: 11 }, { x: 16, y: 11 }, { x: 17, y: 11 },
  { x: 20, y: 9 }, { x: 21, y: 9 }, { x: 22, y: 9 },
  { x: 20, y: 10 }, { x: 22, y: 10 },
  { x: 20, y: 11 }, { x: 21, y: 11 }, { x: 22, y: 11 },
  { x: 12, y: 6 }, { x: 12, y: 7 }, { x: 12, y: 8 },
  { x: 13, y: 6 }, { x: 13, y: 8 },
]

const isWall = (x: number, y: number): boolean => {
  return WALLS.some(wall => wall.x === x && wall.y === y)
}

export default function PacmanGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [pacman, setPacman] = useState<Position>({ x: 1, y: 1 })
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT')
  const [dots, setDots] = useState<Position[]>([])
  const [score, setScore] = useState(0)
  const [mouthOpen, setMouthOpen] = useState(true)
  const [ghosts, setGhosts] = useState<Ghost[]>([])

  const initializeGhosts = (): Ghost[] => {
    return INITIAL_GHOST_POSITIONS.map((pos, index) => ({
      ...pos,
      color: GHOST_COLORS[index],
      direction: ['UP', 'DOWN', 'LEFT', 'RIGHT'][Math.floor(Math.random() * 4)] as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
    }))
  }

  const initializeDots = () => {
    const newDots: Position[] = []
    for (let x = 1; x < GRID_WIDTH - 1; x++) {
      for (let y = 1; y < GRID_HEIGHT - 1; y++) {
        if (!isWall(x, y) && (x !== 1 || y !== 1)) {
          newDots.push({ x, y })
        }
      }
    }
    return newDots
  }

  useEffect(() => {
    if (gameStarted) {
      setDots(initializeDots())
      setGhosts(initializeGhosts())
      setGameOver(false)
    }
  }, [gameStarted])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          setDirection('UP')
          break
        case 'ArrowDown':
          setDirection('DOWN')
          break
        case 'ArrowLeft':
          setDirection('LEFT')
          break
        case 'ArrowRight':
          setDirection('RIGHT')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setMouthOpen(prev => !prev)
    }, 200)
    return () => clearInterval(interval)
  }, [])

  // ゴーストの移動
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const moveGhosts = () => {
      setGhosts(prevGhosts => 
        prevGhosts.map(ghost => {
          const possibleDirections: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[] = []
          
          if (!isWall(ghost.x, ghost.y - 1)) possibleDirections.push('UP')
          if (!isWall(ghost.x, ghost.y + 1)) possibleDirections.push('DOWN')
          if (!isWall(ghost.x - 1, ghost.y)) possibleDirections.push('LEFT')
          if (!isWall(ghost.x + 1, ghost.y)) possibleDirections.push('RIGHT')

          // ランダムに方向を変える（20%の確率）
          let newDirection = ghost.direction
          if (Math.random() < 0.2 && possibleDirections.length > 0) {
            newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)]
          }

          let newX = ghost.x
          let newY = ghost.y

          switch (newDirection) {
            case 'UP':
              newY = ghost.y - 1
              break
            case 'DOWN':
              newY = ghost.y + 1
              break
            case 'LEFT':
              newX = ghost.x - 1
              break
            case 'RIGHT':
              newX = ghost.x + 1
              break
          }

          // 壁チェック
          if (isWall(newX, newY)) {
            // 壁にぶつかったら別の方向を選ぶ
            if (possibleDirections.length > 0) {
              newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)]
              newX = ghost.x
              newY = ghost.y
              switch (newDirection) {
                case 'UP':
                  newY = ghost.y - 1
                  break
                case 'DOWN':
                  newY = ghost.y + 1
                  break
                case 'LEFT':
                  newX = ghost.x - 1
                  break
                case 'RIGHT':
                  newX = ghost.x + 1
                  break
              }
            } else {
              return ghost
            }
          }

          return { ...ghost, x: newX, y: newY, direction: newDirection }
        })
      )
    }

    const interval = setInterval(moveGhosts, 300)
    return () => clearInterval(interval)
  }, [gameStarted, gameOver])

  // パックマンの移動
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const movePacman = () => {
      setPacman(prev => {
        let newX = prev.x
        let newY = prev.y

        switch (direction) {
          case 'UP':
            newY = prev.y - 1
            break
          case 'DOWN':
            newY = prev.y + 1
            break
          case 'LEFT':
            newX = prev.x - 1
            break
          case 'RIGHT':
            newX = prev.x + 1
            break
        }

        // 壁チェック
        if (isWall(newX, newY)) {
          return prev
        }

        // ドットを食べる（正確な位置で判定）
        setDots(prevDots => {
          const dotIndex = prevDots.findIndex(dot => dot.x === newX && dot.y === newY)
          if (dotIndex !== -1) {
            setScore(prevScore => prevScore + 10)
            return prevDots.filter((_, i) => i !== dotIndex)
          }
          return prevDots
        })

        return { x: newX, y: newY }
      })
    }

    const interval = setInterval(movePacman, 200)
    return () => clearInterval(interval)
  }, [direction, gameStarted, gameOver])

  // 衝突判定
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const checkCollision = () => {
      const collision = ghosts.some(ghost => 
        ghost.x === pacman.x && ghost.y === pacman.y
      )
      if (collision) {
        setGameOver(true)
      }
    }

    checkCollision()
  }, [pacman, ghosts, gameStarted, gameOver])

  const getRotation = () => {
    switch (direction) {
      case 'UP': return 270
      case 'DOWN': return 90
      case 'LEFT': return 180
      case 'RIGHT': return 0
    }
  }

  const startGame = () => {
    setPacman({ x: 1, y: 1 })
    setDirection('RIGHT')
    setScore(0)
    setGameOver(false)
    setGameStarted(true)
  }

  const restartGame = () => {
    setPacman({ x: 1, y: 1 })
    setDirection('RIGHT')
    setScore(0)
    setGameOver(false)
    setDots(initializeDots())
    setGhosts(initializeGhosts())
  }

  const handleTouch = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = touch.clientX - rect.left - rect.width / 2
    const y = touch.clientY - rect.top - rect.height / 2

    if (Math.abs(x) > Math.abs(y)) {
      setDirection(x > 0 ? 'RIGHT' : 'LEFT')
    } else {
      setDirection(y > 0 ? 'DOWN' : 'UP')
    }
  }

  if (!gameStarted) {
    return (
      <div className={styles.pacmanContainer}>
        <div className={styles.scoreBoard}>0</div>
        <div 
          className={styles.grid}
          style={{
            width: GRID_WIDTH * CELL_SIZE,
            height: GRID_HEIGHT * CELL_SIZE
          }}
        >
          <div className={styles.startScreen}>
            <div className={styles.startTitle}>PAC-MAN</div>
            <button 
              type="button"
              className={styles.startButton}
              onClick={startGame}
            >
              スタート
            </button>
          </div>
        </div>
        <div className={styles.instructions}>
          矢印キーまたは画面スワイプで操作
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pacmanContainer}>
      <div className={styles.scoreBoard}>
        {score}
      </div>
      <div 
        className={styles.grid}
        style={{
          width: GRID_WIDTH * CELL_SIZE,
          height: GRID_HEIGHT * CELL_SIZE
        }}
        onTouchStart={handleTouch}
      >
        {WALLS.map((wall, index) => (
          <div
            key={`wall-${index}`}
            className={styles.wall}
            style={{
              left: wall.x * CELL_SIZE,
              top: wall.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE
            }}
          />
        ))}
        {dots.map((dot, index) => (
          <div
            key={index}
            className={styles.dot}
            style={{
              left: dot.x * CELL_SIZE + CELL_SIZE / 2 - 3,
              top: dot.y * CELL_SIZE + CELL_SIZE / 2 - 3
            }}
          />
        ))}
        {ghosts.map((ghost, index) => (
          <div
            key={`ghost-${index}`}
            className={styles.ghost}
            style={{
              left: ghost.x * CELL_SIZE,
              top: ghost.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: ghost.color
            }}
          />
        ))}
        <div
          className={`${styles.pacman} ${mouthOpen ? styles.mouthOpen : styles.mouthClosed}`}
          style={{
            left: pacman.x * CELL_SIZE,
            top: pacman.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            transform: `rotate(${getRotation()}deg)`
          }}
        />
        {gameOver && (
          <div className={styles.gameOverScreen}>
            <div className={styles.gameOverTitle}>GAME OVER</div>
            <div className={styles.finalScore}>スコア: {score}</div>
            <button 
              type="button"
              className={styles.startButton}
              onClick={restartGame}
            >
              リトライ
            </button>
          </div>
        )}
      </div>
      <div className={styles.instructions}>
        矢印キーまたは画面スワイプで操作
      </div>
    </div>
  )
}
