export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget
  const allImages = JSON.parse(img.dataset.images || '[]')
  let idx = parseInt(img.dataset.index || '0') + 1
  while (idx < allImages.length) {
    const nextUrl = allImages[idx]
    if (nextUrl && nextUrl !== img.src) {
      img.dataset.index = idx.toString()
      img.src = nextUrl
      return
    }
    idx++
  }
  img.src = '/default-avatar.png'
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
