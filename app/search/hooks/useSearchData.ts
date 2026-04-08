import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Tweet } from '../types'
import { verifyRecaptcha } from '../utils/recaptchaVerify'

interface UseSearchDataProps {
  submittedQuery: string
  mediaFilter: string
  sortBy: 'relevance' | 'latest' | 'oldest' | 'popular'
  executeRecaptcha: (action: string) => Promise<string | null>
  page: number
}

const PAGE_SIZE = 10
const IMAGE_PAGE_SIZE = 100

export function useSearchData({
  submittedQuery,
  mediaFilter,
  sortBy,
  executeRecaptcha,
  page,
}: UseSearchDataProps) {
  const router = useRouter()
  const [filteredTweets, setFilteredTweets] = useState<Tweet[]>([])
  const [isLoading, setIsLoading] = useState(!submittedQuery ? false : true)
  const [total, setTotal] = useState(0)
  const executeRecaptchaRef = useRef(executeRecaptcha)
  const routerRef = useRef(router)

  useEffect(() => {
    executeRecaptchaRef.current = executeRecaptcha
    routerRef.current = router
  })

  useEffect(() => {
    if (!submittedQuery) {
      setIsLoading(false)
      setFilteredTweets([])
      setTotal(0)
      return
    }

    let isCancelled = false

    const verifyAndSearch = async () => {
      setIsLoading(true)

      const verified = await verifyRecaptcha(executeRecaptchaRef.current, 'search_url')
      if (!verified) {
        alert('セキュリティ検証に失敗しました。ネットワーク接続を確認してページを再読み込みしてください。')
        routerRef.current.push('/')
        return
      }

      try {
        const isMediaSearch = mediaFilter === 'isch' || mediaFilter === 'vid'
        const pageSize = isMediaSearch ? IMAGE_PAGE_SIZE : PAGE_SIZE
        const offset = (page - 1) * pageSize

        const tweetResponse = await fetch(
          `/api/tweets/stream?q=${encodeURIComponent(submittedQuery)}&tbm=${mediaFilter}&sortBy=${sortBy}&limit=${pageSize}&offset=${offset}`,
        )

        const data = await tweetResponse.json()

        if (isCancelled) return

        if (data.error) {
          throw new Error(data.error)
        }

        const uniqueTweets = Array.from(
          new Map((data.tweets || []).map((tweet: Tweet) => [tweet.id, tweet])).values(),
        ) as Tweet[]

        setFilteredTweets(uniqueTweets)
        setTotal(data.total || 0)
        setIsLoading(false)
      } catch (error) {
        if (!isCancelled) {
          console.error('Search error:', error)
          setFilteredTweets([])
          setTotal(0)
          setIsLoading(false)
        }
      }
    }

    verifyAndSearch()

    return () => {
      isCancelled = true
    }
  }, [submittedQuery, mediaFilter, sortBy, page])

  const totalPages = Math.ceil(
    total / (mediaFilter === 'isch' || mediaFilter === 'vid' ? IMAGE_PAGE_SIZE : PAGE_SIZE),
  )

  return {
    filteredTweets,
    isLoading,
    total,
    totalPages,
  }
}
