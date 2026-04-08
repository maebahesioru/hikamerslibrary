'use client'

import { useState, useEffect, useRef } from 'react'

interface LazyIframeProps {
  src: string
  title: string
  width?: string | number
  height?: string | number
  className?: string
  style?: React.CSSProperties
}

export default function LazyIframe({ src, title, width, height, className, style }: LazyIframeProps) {
  const [isInView, setIsInView] = useState(false)
  const iframeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!iframeRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '100px' }
    )

    observer.observe(iframeRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={iframeRef} style={{ width, height, ...style }}>
      {isInView ? (
        <iframe
          src={src}
          title={title}
          width={width}
          height={height}
          className={className}
          loading="lazy"
          style={{ border: 'none' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          読み込み中...
        </div>
      )}
    </div>
  )
}
