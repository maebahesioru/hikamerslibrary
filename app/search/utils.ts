export const extractMediaUrls = (mediaStr: string): string[] => {
  if (!mediaStr || mediaStr === 'なし') return []
  
  try {
    // 1. JSON配列形式: ["https://...", "https://..."]
    if (mediaStr.startsWith('[') && mediaStr.endsWith(']')) {
      const parsed = JSON.parse(mediaStr)
      if (Array.isArray(parsed)) {
        return parsed.filter((url: string) => typeof url === 'string' && url.startsWith('http'))
      }
    }
    
    // 2. Python dict形式: {'type': 'image', 'item': {'url': '...', 'mediaUrl': '...'}}
    if (mediaStr.startsWith('{') || mediaStr.startsWith("{'")) {
      // 正規表現で直接URLを抽出（JSONパースより確実）
      const urls: string[] = []
      
      // mediaUrl を優先的に抽出
      const mediaUrlMatch = mediaStr.match(/'mediaUrl':\s*'([^']+)'/)
      if (mediaUrlMatch && mediaUrlMatch[1].startsWith('http')) {
        urls.push(mediaUrlMatch[1])
      }
      
      // expandedUrl も抽出
      const expandedMatch = mediaStr.match(/'expandedUrl':\s*'([^']+)'/)
      if (expandedMatch && expandedMatch[1].startsWith('http') && !urls.includes(expandedMatch[1])) {
        urls.push(expandedMatch[1])
      }
      
      // url も抽出（t.co短縮URL）
      const urlMatch = mediaStr.match(/'url':\s*'([^']+)'/)
      if (urlMatch && urlMatch[1].startsWith('http') && !urls.includes(urlMatch[1])) {
        urls.push(urlMatch[1])
      }
      
      if (urls.length > 0) return urls
    }
    
    // 3. 既存形式: 'mediaUrl': 'https://...'
    const mediaUrlMatches = mediaStr.matchAll(/'mediaUrl':\s*'([^']+)'/g)
    const mediaUrls: string[] = []
    for (const match of mediaUrlMatches) {
      if (match[1].startsWith('http')) mediaUrls.push(match[1])
    }
    if (mediaUrls.length > 0) return mediaUrls
    
    // 4. expandedUrl形式: 'expandedUrl': 'https://...'
    const expandedMatches = mediaStr.matchAll(/'expandedUrl':\s*'([^']+)'/g)
    for (const match of expandedMatches) {
      if (match[1].startsWith('http')) mediaUrls.push(match[1])
    }
    if (mediaUrls.length > 0) return mediaUrls
    
    // 5. 直接URL形式: https://pbs.twimg.com/... (カンマ区切り対応)
    if (mediaStr.includes('http')) {
      return mediaStr.split(',').map(u => u.trim()).filter(u => u.startsWith('http'))
    }
    
    return []
  } catch {
    // パース失敗時は直接URL形式として処理
    if (mediaStr.includes('http')) {
      return mediaStr.split(',').map(u => u.trim()).filter(u => u.startsWith('http'))
    }
    return []
  }
}

export const extractThumbnailUrls = (mediaStr: string): string[] => {
  try {
    const matches = mediaStr.matchAll(/'thumbnailImageUrl':\s*'([^']+)'/g)
    const urls: string[] = []
    for (const match of matches) {
      urls.push(match[1])
    }
    return urls
  } catch {
    return []
  }
}

export const getTweetUrl = (userId: string, tweetId: string): string => {
  return `https://x.com/${userId}/status/${tweetId}`
}

export const getPageNumbers = (currentPage: number, totalPages: number): number[] => {
  const pages = []
  const maxVisible = 10

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage <= 6) {
      for (let i = 1; i <= 10; i++) {
        pages.push(i)
      }
    } else if (currentPage >= totalPages - 4) {
      for (let i = totalPages - 9; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      for (let i = currentPage - 4; i <= currentPage + 5; i++) {
        pages.push(i)
      }
    }
  }

  return pages
}
