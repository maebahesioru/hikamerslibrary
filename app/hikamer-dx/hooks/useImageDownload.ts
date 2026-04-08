'use client'

import { RefObject } from 'react'

export function useImageDownload(pyramidRef: RefObject<HTMLDivElement | null>, getDateLabel: () => string) {
  const downloadImage = async () => {
    if (!pyramidRef.current) return
    
    const images = pyramidRef.current.querySelectorAll('img')
    const originalSrcs: { img: HTMLImageElement; src: string }[] = []
    
    // デフォルトアバターをBase64に変換
    let defaultAvatarBase64 = ''
    try {
      const defaultRes = await fetch('/default-avatar.png')
      if (defaultRes.ok) {
        const blob = await defaultRes.blob()
        defaultAvatarBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
      }
    } catch (e) {}
    
    await Promise.all(Array.from(images).map(async (img) => {
      try {
        originalSrcs.push({ img, src: img.src })
        
        if (img.src.includes('default-avatar')) {
          if (defaultAvatarBase64) img.src = defaultAvatarBase64
          return
        }
        
        const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(img.src)}`)
        if (response.ok) {
          const blob = await response.blob()
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
          img.src = dataUrl
        } else if (defaultAvatarBase64) {
          img.src = defaultAvatarBase64
        }
      } catch (e) {
        if (defaultAvatarBase64) img.src = defaultAvatarBase64
      }
    }))
    
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(pyramidRef.current, { 
      backgroundColor: '#1a1a1a', 
      scale: 2,
      useCORS: true,
      allowTaint: true
    })
    
    originalSrcs.forEach(({ img, src }) => { img.src = src })
    
    const link = document.createElement('a')
    link.download = `ヒカマー表_${getDateLabel().replace(/[〜\/]/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return { downloadImage }
}
