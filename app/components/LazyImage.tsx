'use client'

import { useState, useEffect, useRef } from 'react'
import Image, { ImageProps } from 'next/image'

interface LazyImageProps extends Omit<ImageProps, 'onLoad'> {
  fallbackSrc?: string
}

export default function LazyImage({ 
  src, 
  alt, 
  fallbackSrc = '/default-avatar.png',
  className = '',
  ...props 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setError(true)
  }

  return (
    <div 
      ref={imgRef} 
      className={`lazy-image-wrapper ${className}`}
      style={{ position: 'relative' }}
    >
      {isInView && (
        <Image
          src={error ? fallbackSrc : src}
          alt={alt}
          className={`${className} ${isLoaded ? 'loaded' : ''}`}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
      {!isLoaded && isInView && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg-tertiary)',
            borderRadius: 'inherit',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        />
      )}
    </div>
  )
}
