'use client'

import { useState, useEffect } from 'react'
import styles from './PeriodicTable3D.module.css'
import { elements, categoryColors, Element } from './periodicTableData'

export default function PeriodicTable3D() {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null)
  const [rotateX, setRotateX] = useState(20)
  const [rotateY, setRotateY] = useState(20)
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault() // テキスト選択を防ぐ
    setIsDragging(true)
    setStartPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault() // テキスト選択を防ぐ
    const deltaX = e.clientX - startPos.x
    const deltaY = e.clientY - startPos.y
    setRotateY(rotateY + deltaX * 0.5)
    setRotateX(rotateX - deltaY * 0.5)
    setStartPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(Math.max(0.5, Math.min(3, zoom + delta)))
  }

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5))
  }

  const handleResetView = () => {
    setRotateX(20)
    setRotateY(20)
    setZoom(1)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none' // テキスト選択を無効化
    } else {
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto' // テキスト選択を有効化
    }
  }, [isDragging])

  return (
    <div className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''}`}>
      <div className={styles.header}>
        <h2>元素周期表 (Periodic Table)</h2>
        <p>ドラッグして回転 | クリックで詳細表示</p>
        <div className={styles.controls}>
          <button type="button" onClick={handleZoomOut} className={styles.controlBtn} title="縮小">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button type="button" onClick={handleZoomIn} className={styles.controlBtn} title="拡大">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button type="button" onClick={handleResetView} className={styles.controlBtn} title="リセット">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
            </svg>
          </button>
          <button type="button" onClick={toggleFullscreen} className={styles.controlBtn} title={isFullscreen ? '通常表示' : '全画面表示'}>
            {isFullscreen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      <div 
        className={styles.scene}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ userSelect: 'none' }}
      >
        <div 
          className={styles.table}
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${zoom})`
          }}
        >
          {elements.map((element) => (
            <div
              key={element.number}
              className={styles.element}
              style={{
                backgroundColor: categoryColors[element.category],
                gridRow: element.row,
                gridColumn: element.col,
              }}
              onClick={() => setSelectedElement(element)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateZ(20px) scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateZ(0) scale(1)'
              }}
            >
              <div className={styles.number}>{element.number}</div>
              <div className={styles.symbol}>{element.symbol}</div>
              <div className={styles.name}>{element.nameJa}</div>
              <div className={styles.mass}>{element.mass}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedElement && (
        <div className={styles.info}>
          <button 
            className={styles.closeBtn}
            onClick={() => setSelectedElement(null)}
          >
            ×
          </button>
          <h3>{selectedElement.symbol} - {selectedElement.nameJa}</h3>
          <p><strong>英名:</strong> {selectedElement.name}</p>
          <p><strong>原子番号:</strong> {selectedElement.number}</p>
          <p><strong>原子量:</strong> {selectedElement.mass}</p>
        </div>
      )}

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: categoryColors['alkali'] }}></span>
          アルカリ金属
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: categoryColors['alkaline'] }}></span>
          アルカリ土類
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: categoryColors['transition'] }}></span>
          遷移金属
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: categoryColors['nonmetal'] }}></span>
          非金属
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: categoryColors['halogen'] }}></span>
          ハロゲン
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: categoryColors['noble-gas'] }}></span>
          希ガス
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: categoryColors['lanthanide'] }}></span>
          ランタノイド
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: categoryColors['actinide'] }}></span>
          アクチノイド
        </div>
      </div>
    </div>
  )
}
