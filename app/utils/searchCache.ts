const searchCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

export function getCacheKey(params: URLSearchParams): string {
  const keys = ['q', 'limit', 'offset', 'sortBy', 'searchLevel', 'from', 'to', 'since', 'until']
  return keys.map(k => `${k}=${params.get(k) || ''}`).join('&')
}

export function getFromCache(key: string): any | null {
  const cached = searchCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data
  if (cached) searchCache.delete(key)
  return null
}

export function setCache(key: string, data: any): void {
  if (searchCache.size > 100) {
    const oldest = searchCache.keys().next().value
    if (oldest) searchCache.delete(oldest)
  }
  searchCache.set(key, { data, timestamp: Date.now() })
}
