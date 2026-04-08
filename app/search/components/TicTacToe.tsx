'use client'

import { useState, useEffect } from 'react'
import styles from './TicTacToe.module.css'

type Player = 'X' | 'O' | null

export default function TicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState<Player | 'draw' | null>(null)

  const calculateWinner = (squares: Player[]): Player | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const minimax = (squares: Player[], isMaximizing: boolean): number => {
    const winner = calculateWinner(squares)
    if (winner === 'O') return 10
    if (winner === 'X') return -10
    if (squares.every(cell => cell !== null)) return 0

    if (isMaximizing) {
      let bestScore = -Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'O'
          const score = minimax(squares, false)
          squares[i] = null
          bestScore = Math.max(score, bestScore)
        }
      }
      return bestScore
    } else {
      let bestScore = Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'X'
          const score = minimax(squares, true)
          squares[i] = null
          bestScore = Math.min(score, bestScore)
        }
      }
      return bestScore
    }
  }

  const getBestMove = (squares: Player[]): number => {
    // 20%の確率でランダムな手を打つ
    if (Math.random() < 0.2) {
      const availableMoves = squares
        .map((cell, index) => cell === null ? index : -1)
        .filter(index => index !== -1)
      if (availableMoves.length > 0) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)]
      }
    }

    let bestScore = -Infinity
    let bestMove = -1

    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = 'O'
        const score = minimax(squares, false)
        squares[i] = null
        if (score > bestScore) {
          bestScore = score
          bestMove = i
        }
      }
    }
    return bestMove
  }

  const makeAIMove = (currentBoard: Player[]) => {
    const bestMove = getBestMove([...currentBoard])
    if (bestMove !== -1) {
      setTimeout(() => {
        const newBoard = [...currentBoard]
        newBoard[bestMove] = 'O'
        setBoard(newBoard)

        const gameWinner = calculateWinner(newBoard)
        if (gameWinner) {
          setWinner(gameWinner)
        } else if (newBoard.every(cell => cell !== null)) {
          setWinner('draw')
        } else {
          setIsXNext(true)
        }
      }, 500)
    }
  }

  useEffect(() => {
    if (!isXNext && !winner) {
      makeAIMove(board)
    }
  }, [isXNext, winner])

  const handleClick = (index: number) => {
    if (board[index] || winner || !isXNext) return

    const newBoard = [...board]
    newBoard[index] = 'X'
    setBoard(newBoard)

    const gameWinner = calculateWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
    } else if (newBoard.every(cell => cell !== null)) {
      setWinner('draw')
    } else {
      setIsXNext(false)
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinner(null)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>三目並べ</h2>
        <button type="button" onClick={resetGame} className={styles.resetBtn}>新しいゲーム</button>
      </div>
      <div className={styles.status}>
        {winner === 'draw' ? '引き分け！' : winner === 'X' ? 'あなたの勝ち！' : winner === 'O' ? 'AIの勝ち！' : isXNext ? 'あなたの番 (X)' : 'AIの番 (O)'}
      </div>
      <div className={styles.board}>
        {board.map((cell, i) => (
          <button
            type="button"
            key={i}
            className={styles.cell}
            onClick={() => handleClick(i)}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  )
}
