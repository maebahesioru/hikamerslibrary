'use client'

import { useState, useEffect } from 'react'
import styles from './MinecraftBlocks.module.css'

interface Block {
  id: number
  x: number
  y: number
  cracking: number
}

interface MinecraftBlocksProps {
  onClose: () => void
}

export default function MinecraftBlocks({ onClose }: MinecraftBlocksProps) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [nextId, setNextId] = useState(0)

  useEffect(() => {
    // ランダムに土ブロックを生成
    const generateBlocks = () => {
      const newBlocks: Block[] = []
      for (let i = 0; i < 15; i++) {
        newBlocks.push({
          id: nextId + i,
          x: Math.random() * (window.innerWidth - 60),
          y: Math.random() * (window.innerHeight - 60) + 100,
          cracking: 0
        })
      }
      setBlocks(newBlocks)
      setNextId(prev => prev + 15)
    }

    generateBlocks()
  }, [])

  const handleBlockClick = (blockId: number) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        const newCracking = block.cracking + 1
        if (newCracking >= 3) {
          // ブロックを削除
          setTimeout(() => {
            setBlocks(prev => prev.filter(b => b.id !== blockId))
          }, 100)
          return { ...block, cracking: 3 }
        }
        return { ...block, cracking: newCracking }
      }
      return block
    }))
  }

  return (
    <div className={styles.minecraftContainer}>
      <div className={styles.instructions}>
        ⛏️ 土ブロックをクリックして破壊しよう！
      </div>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="マインクラフトを閉じる"
      >
        ✕
      </button>
      {blocks.map(block => (
        <div
          key={block.id}
          className={`${styles.block} ${block.cracking === 3 ? styles.breaking : ''}`}
          style={{
            left: `${block.x}px`,
            top: `${block.y}px`
          }}
          onClick={() => handleBlockClick(block.id)}
        >
          {block.cracking > 0 && (
            <div className={`${styles.crack} ${styles[`crack${block.cracking}`]}`} />
          )}
        </div>
      ))}
    </div>
  )
}
