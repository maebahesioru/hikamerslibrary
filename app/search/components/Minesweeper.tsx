'use client'

import { useState, useEffect } from 'react'
import styles from './Minesweeper.module.css'

interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

type Difficulty = 'easy' | 'medium' | 'hard'

interface DifficultyConfig {
  rows: number
  cols: number
  mines: number
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: { rows: 8, cols: 8, mines: 10 },
  medium: { rows: 12, cols: 12, mines: 25 },
  hard: { rows: 16, cols: 16, mines: 50 }
}

export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [board, setBoard] = useState<Cell[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [flagCount, setFlagCount] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const config = DIFFICULTY_CONFIGS[difficulty]
  const ROWS = config.rows
  const COLS = config.cols
  const MINES = config.mines

  useEffect(() => {
    initBoard()
  }, [difficulty])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && !gameOver && !won) {
      interval = setInterval(() => {
        setTimer(t => t + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, gameOver, won])

  const initBoard = () => {
    const newBoard: Cell[][] = Array(ROWS).fill(null).map(() =>
      Array(COLS).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    )

    // Place mines
    let minesPlaced = 0
    while (minesPlaced < MINES) {
      const row = Math.floor(Math.random() * ROWS)
      const col = Math.floor(Math.random() * COLS)
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true
        minesPlaced++
      }
    }

    // Calculate neighbor mines
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr
              const nc = c + dc
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newBoard[nr][nc].isMine) {
                count++
              }
            }
          }
          newBoard[r][c].neighborMines = count
        }
      }
    }

    setBoard(newBoard)
    setGameOver(false)
    setWon(false)
    setFlagCount(0)
    setTimer(0)
    setIsPlaying(false)
  }

  const revealCell = (row: number, col: number) => {
    if (gameOver || won || board[row][col].isRevealed || board[row][col].isFlagged) return

    if (!isPlaying) {
      setIsPlaying(true)
    }

    const newBoard = [...board.map(r => [...r])]
    
    if (newBoard[row][col].isMine) {
      // 全ての地雷を表示
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (newBoard[r][c].isMine) {
            newBoard[r][c].isRevealed = true
          }
        }
      }
      setBoard(newBoard)
      setGameOver(true)
      return
    }

    const reveal = (r: number, c: number) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return
      if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged || newBoard[r][c].isMine) return
      
      newBoard[r][c].isRevealed = true
      
      // 空のセル（0）の場合、周囲のすべてのセルを開く
      if (newBoard[r][c].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) {
              const nr = r + dr
              const nc = c + dc
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                if (!newBoard[nr][nc].isRevealed && !newBoard[nr][nc].isFlagged && !newBoard[nr][nc].isMine) {
                  reveal(nr, nc)
                }
              }
            }
          }
        }
      }
    }

    reveal(row, col)
    setBoard(newBoard)
    checkWin(newBoard)
  }

  const toggleFlag = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    if (gameOver || won || board[row][col].isRevealed) return

    const newBoard = [...board.map(r => [...r])]
    const wasFlagged = newBoard[row][col].isFlagged
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged
    setBoard(newBoard)
    setFlagCount(wasFlagged ? flagCount - 1 : flagCount + 1)
  }

  const checkWin = (currentBoard: Cell[][]) => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!currentBoard[r][c].isMine && !currentBoard[r][c].isRevealed) {
          return
        }
      }
    }
    setWon(true)
  }

  const changeDifficulty = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty)
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.difficultySelector}>
          <button
            type="button"
            className={`${styles.difficultyBtn} ${difficulty === 'easy' ? styles.active : ''}`}
            onClick={() => changeDifficulty('easy')}
          >
            低
          </button>
          <button
            type="button"
            className={`${styles.difficultyBtn} ${difficulty === 'medium' ? styles.active : ''}`}
            onClick={() => changeDifficulty('medium')}
          >
            中
          </button>
          <button
            type="button"
            className={`${styles.difficultyBtn} ${difficulty === 'hard' ? styles.active : ''}`}
            onClick={() => changeDifficulty('hard')}
          >
            高
          </button>
        </div>
      </div>
      <div className={styles.header}>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.icon}>🚩</span>
            <span className={styles.statValue}>{MINES - flagCount}</span>
          </div>
          <button type="button" onClick={initBoard} className={styles.resetBtn}>
            {gameOver ? '😵' : won ? '😎' : '😊'}
          </button>
          <div className={styles.statItem}>
            <span className={styles.icon}>⏱️</span>
            <span className={styles.statValue}>{timer.toString().padStart(3, '0')}</span>
          </div>
        </div>
      </div>
      <div className={styles.board}>
        {board.map((row, r) => (
          <div key={r} className={styles.row}>
            {row.map((cell, c) => (
              <button
                type="button"
                key={c}
                className={`${styles.cell} ${cell.isRevealed ? styles.revealed : ''} ${cell.isFlagged ? styles.flagged : ''} ${cell.isRevealed && cell.neighborMines > 0 ? styles[`num${cell.neighborMines}`] : ''} ${cell.isRevealed && cell.neighborMines === 0 && !cell.isMine ? styles.num0 : ''}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={(e) => toggleFlag(e, r, c)}
              >
                {cell.isRevealed && (cell.isMine ? '💣' : cell.neighborMines > 0 ? cell.neighborMines : '')}
                {cell.isFlagged && !cell.isRevealed && '🚩'}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
