'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ConversationEntry, MediaFile, SearchQuery, TokenUsage, ContextStats,
  LoadingStep, LightTweet, UseAiSearchProps
} from './types'
import {
  MAX_TWEETS, sortByEngagement, toLightTweet, buildSearchParams,
  getDateFilter, buildCompressedContext, extractRelatedQuestions
} from './utils'

export type { LoadingStep } from './types'

export function useAiSearch({ submittedQuery, shareId, executeRecaptcha, mediaFiles }: UseAiSearchProps) {
  const router = useRouter()
  const [aiResponse, setAiResponse] = useState('')
  const [aiThinking, setAiThinking] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('keywords')
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([])
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [referencedTweets, setReferencedTweets] = useState<LightTweet[]>([])
  const [searchQueries, setSearchQueries] = useState<string[]>([])
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([])
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null)
  const [contextStats, setContextStats] = useState<ContextStats | null>(null)
  const loadingRef = useRef(false)
  
  const mediaFilesRef = useRef(mediaFiles)
  mediaFilesRef.current = mediaFiles

  // 共有リンクから会話を読み込む
  useEffect(() => {
    if (!shareId) return
    const loadShared = async () => {
      try {
        const response = await fetch(`/api/share?id=${shareId}`)
        if (response.ok) {
          const data = await response.json()
          setAiResponse(data.response)
          if (data.tweets) setReferencedTweets(data.tweets)
          if (data.searchQueries) setSearchQueries(data.searchQueries)
        }
      } catch (error) {
        console.error('[Share] Error:', error)
      }
      setIsInitialized(true)
    }
    loadShared()
  }, [shareId])

  // 初期化
  const initializedRef = useRef(false)
  useEffect(() => {
    if (shareId || initializedRef.current) return
    initializedRef.current = true
    setIsInitialized(true)
  }, [shareId])

  const conversationHistoryRef = useRef(conversationHistory)
  conversationHistoryRef.current = conversationHistory

  const handleAiQuery = useCallback(async (query: string, searchContext: string, tweets: LightTweet[] = [], files?: MediaFile[]) => {
    setIsLoading(true)
    setAiResponse('')
    setAiThinking('')
    setTokenUsage(null)
    setRelatedQuestions([])

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          searchContext,
          conversationHistory: conversationHistoryRef.current.map(h => 
            `Q: ${h.query}${h.thinking ? `\n[推論]: ${h.thinking}` : ''}\nA: ${h.response}`
          ).join('\n\n'),
          mediaFiles: files
        })
      })

      if (!response.ok) {
        const data = await response.json()
        setAiResponse(`エラー: ${data.error}`)
        setIsLoading(false)
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        setAiResponse('ストリーミングに対応していません。')
        setIsLoading(false)
        return
      }

      const decoder = new TextDecoder()
      let accumulatedText = ''
      let accumulatedThinking = ''
      let buffer = ''
      let hasStartedStreaming = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.replace('data: ', ''))
            if (data.thought) {
              accumulatedThinking += data.thought
              setAiThinking(accumulatedThinking)
            }
            if (data.text) {
              accumulatedText += data.text
              const displayText = accumulatedText.replace(/---RELATED_QUESTIONS---[\s\S]*?---END_RELATED_QUESTIONS---/g, '').trim()
              setAiResponse(displayText)
              if (!hasStartedStreaming) {
                setIsLoading(false)
                hasStartedStreaming = true
              }
            }
            if (data.tokenUsage) setTokenUsage(data.tokenUsage)
          } catch (e) {
            console.error('[Client] Parse error:', e)
          }
        }
      }

      setIsLoading(false)
      
      const { cleanText, questions } = extractRelatedQuestions(accumulatedText)
      if (questions.length > 0) {
        setRelatedQuestions(questions)
        setAiResponse(cleanText)
        accumulatedText = cleanText
      }
      
      if (accumulatedText) {
        setConversationHistory(prev => [...prev, { query, response: accumulatedText, thinking: accumulatedThinking, tweets }])
      }
    } catch (error) {
      console.error('AI query error:', error)
      setAiResponse('AI応答の取得中にエラーが発生しました。')
      setIsLoading(false)
    }
  }, [])

  const previousKeywordsRef = useRef<string[]>([])

  const loadTweetsAndQuery = useCallback(async (query: string) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setIsLoading(true)
    setLoadingStep('keywords')
    setExtractedKeywords([])
    setReferencedTweets([])

    try {
      const keywordResponse = await fetch('/api/extract-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, previousKeywords: previousKeywordsRef.current })
      })
      const keywordData = await keywordResponse.json()
      const extractedKeywords: SearchQuery[] = keywordData.keywords || []
      
      const limitedKeywords = extractedKeywords.map(k => ({
        ...k,
        count: Math.min(k.count, MAX_TWEETS)
      }))

      if (!keywordData.isVague && limitedKeywords.length > 0) {
        previousKeywordsRef.current = limitedKeywords.map(k => k.keyword)
      }

      for (let i = 0; i < limitedKeywords.length; i++) {
        setExtractedKeywords(limitedKeywords.slice(0, i + 1).map(k => k.keyword))
        await new Promise(r => setTimeout(r, 200))
      }

      setLoadingStep('tweets')

      const isBuzzQuery = /バズ|人気/.test(query)
      const isDateOnlyQuery = /^(昨日|今日|一週間|1週間|最近)(は|に|の)?(何|なに|なん)?(が|を)?(あった|あっ|起きた|起こった)/.test(query)
      
      let allTweets: any[] = []
      const tweetMap = new Map()
      
      if (!isBuzzQuery && !isDateOnlyQuery && limitedKeywords.length > 0) {
        for (const sq of limitedKeywords) {
          const params = buildSearchParams(sq)
          const res = await fetch(`/api/tweets/stream?${params.toString()}`)
          const data = await res.json()
          
          data.tweets?.forEach((tweet: any) => {
            if (!tweetMap.has(tweet.id)) {
              tweetMap.set(tweet.id, tweet)
            }
          })
          
          setReferencedTweets(Array.from(tweetMap.values()).map(toLightTweet))
        }
        allTweets = Array.from(tweetMap.values())
        setSearchQueries(limitedKeywords.map(k => k.keyword))
      } else {
        const response = await fetch('/api/tweets')
        const data = await response.json()
        allTweets = data.tweets
        setSearchQueries([])
      }

      const dateFilter = getDateFilter(query)
      let relevantTweets = dateFilter ? allTweets.filter(dateFilter) : allTweets
      if (isBuzzQuery) relevantTweets = sortByEngagement(relevantTweets)
      if (relevantTweets.length > MAX_TWEETS) relevantTweets = relevantTweets.slice(0, MAX_TWEETS)

      const lightTweets = relevantTweets.map(toLightTweet)
      setReferencedTweets(lightTweets)

      const tweetsForAi = relevantTweets.slice(0, MAX_TWEETS)
      console.log(`[useAiSearch] maxLimit=${MAX_TWEETS}, relevantTweets=${relevantTweets.length}, tweetsForAi=${tweetsForAi.length}`)

      setLoadingStep('thinking')

      const searchContext = buildCompressedContext(tweetsForAi, '')
      setContextStats({ chars: searchContext.length, tweets: tweetsForAi.length })
      console.log(`[AI Search] Sending ${tweetsForAi.length} tweets to AI (${searchContext.length} chars)`)

      setLoadingStep('generating')

      await handleAiQuery(query, searchContext, lightTweets, mediaFilesRef.current)
    } catch (error) {
      console.error('ツイート読み込みエラー:', error)
      await handleAiQuery(query, '', [], mediaFilesRef.current)
    } finally {
      loadingRef.current = false
    }
  }, [handleAiQuery])

  const executeRecaptchaRef = useRef(executeRecaptcha)
  executeRecaptchaRef.current = executeRecaptcha
  const processedQueryRef = useRef<string | null>(null)
  const isProcessingRef = useRef(false)
  const loadTweetsAndQueryRef = useRef(loadTweetsAndQuery)
  loadTweetsAndQueryRef.current = loadTweetsAndQuery
  const isInitializedRef = useRef(isInitialized)
  isInitializedRef.current = isInitialized

  useEffect(() => {
    if (!submittedQuery || shareId) return
    if (processedQueryRef.current === submittedQuery) return
    if (isProcessingRef.current) return
    
    isProcessingRef.current = true
    processedQueryRef.current = submittedQuery
    
    const checkAndRun = async () => {
      let waitCount = 0
      while (!isInitializedRef.current && waitCount < 10) {
        await new Promise(r => setTimeout(r, 100))
        waitCount++
      }
      if (!isInitializedRef.current) {
        isProcessingRef.current = false
        return
      }

      if (loadingRef.current) {
        isProcessingRef.current = false
        return
      }

      const isFollowUp = sessionStorage.getItem('ai-follow-up') === 'true'
      sessionStorage.removeItem('ai-follow-up')
      
      if (!isFollowUp) {
        setConversationHistory([])
      }
      setAiResponse('')
      setReferencedTweets([])
      setTokenUsage(null)

      const verifiedQueries = sessionStorage.getItem('verified_ai_queries')
      const verifiedList = verifiedQueries ? JSON.parse(verifiedQueries) : []
      
      if (verifiedList.includes(submittedQuery)) {
        await loadTweetsAndQueryRef.current(submittedQuery)
        isProcessingRef.current = false
        return
      }

      const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

      if (isLocalhost) {
        await loadTweetsAndQueryRef.current(submittedQuery)
        isProcessingRef.current = false
        return
      }

      await loadTweetsAndQueryRef.current(submittedQuery)
      isProcessingRef.current = false
      }
    }

    checkAndRun()
  }, [submittedQuery, shareId, router])

  const clearHistory = useCallback(() => {
    setConversationHistory([])
    setAiResponse('')
    setReferencedTweets([])
    setTokenUsage(null)
    previousKeywordsRef.current = []
    router.push('/ai')
  }, [router])

  return {
    aiResponse,
    aiThinking,
    isLoading,
    loadingStep,
    extractedKeywords,
    conversationHistory,
    referencedTweets,
    searchQueries,
    relatedQuestions,
    tokenUsage,
    contextStats,
    clearHistory,
    setAiResponse
  }
}
