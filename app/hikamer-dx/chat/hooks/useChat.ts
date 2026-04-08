'use client'

import { useState, useEffect } from 'react'
import { Message, UserInfo, UserOption } from '../types'
import { fileToBase64 } from '../utils'
import { getRandomSuggestions } from '../suggestions'

export function useChat(userId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [thinking, setThinking] = useState('')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [sampleTweets, setSampleTweets] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedPreviews, setUploadedPreviews] = useState<string[]>([])
  const [randomSuggestions, setRandomSuggestions] = useState<string[]>([])

  // ユーザー変更時にリセット
  useEffect(() => {
    if (!userId) return
    setMessages([])
    setThinking('')
    setInput('')
    setUploadedFiles([])
    setUploadedPreviews([])
    setRandomSuggestions(getRandomSuggestions(3))
    
    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/hikamer-dx/chat?user=${encodeURIComponent(userId)}`)
        if (res.ok) {
          const data = await res.json()
          setUserInfo({
            userName: data.userName,
            profileImageUrl: data.profileImageUrl,
            allProfileImages: data.allProfileImages || [],
            description: data.description
          })
          setSampleTweets(data.sampleTweets || [])
        }
      } catch (e) {
        console.error('Failed to fetch user data:', e)
      }
    }
    fetchUserData()
  }, [userId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    const newFiles: File[] = []
    const newPreviews: string[] = []
    
    for (let i = 0; i < files.length && uploadedFiles.length + newFiles.length < 5; i++) {
      const file = files[i]
      newFiles.push(file)
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        newPreviews.push(URL.createObjectURL(file))
      } else {
        newPreviews.push('')
      }
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    setUploadedPreviews(prev => [...prev, ...newPreviews])
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setUploadedPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading || !userId) return
    
    const userMessage = input.trim()
    setInput('')
    
    const mediaFiles: { data: string; mimeType: string; preview?: string }[] = []
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i]
      const data = await fileToBase64(file)
      mediaFiles.push({ data, mimeType: file.type, preview: uploadedPreviews[i] })
    }
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage, mediaFiles }])
    setUploadedFiles([])
    setUploadedPreviews([])
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/hikamer-dx/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: userMessage,
          history: messages,
          mediaFiles: mediaFiles.map(f => ({ data: f.data, mimeType: f.mimeType }))
        })
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'エラーが発生しました' }))
        throw new Error(errorData.error || 'Failed to get response')
      }
      
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')
      
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let thinkingText = ''
      let sseBuffer = ''
      
      setMessages(prev => [...prev, { role: 'assistant', content: '', thinking: '', relatedQuestions: [] }])
      setThinking('')
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        sseBuffer += decoder.decode(value, { stream: true })
        const events = sseBuffer.split('\n\n')
        sseBuffer = events.pop() || ''
        
        for (const event of events) {
          const line = event.trim()
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            
            if (data.error) {
              assistantMessage = `⚠️ ${data.error}`
              setMessages(prev => {
                const newMessages = [...prev]
                newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantMessage, thinking: thinkingText }
                return newMessages
              })
              continue
            }
            
            if (data.thinking || data.thought) {
              thinkingText += data.thinking || data.thought
              setThinking(thinkingText)
              const displayText = assistantMessage.replace(/---RELATED_QUESTIONS---[\s\S]*?---END_RELATED_QUESTIONS---/g, '').trim()
              setMessages(prev => {
                const newMessages = [...prev]
                newMessages[newMessages.length - 1] = { role: 'assistant', content: displayText, thinking: thinkingText }
                return newMessages
              })
            }
            if (data.text) {
              assistantMessage += data.text
              const displayText = assistantMessage.replace(/---RELATED_QUESTIONS---[\s\S]*?---END_RELATED_QUESTIONS---/g, '').trim()
              setMessages(prev => {
                const newMessages = [...prev]
                newMessages[newMessages.length - 1] = { role: 'assistant', content: displayText, thinking: thinkingText }
                return newMessages
              })
            }
            if (data.done) {
              const relatedMatch = assistantMessage.match(/---RELATED_QUESTIONS---([\s\S]*?)---END_RELATED_QUESTIONS---/)
              let relatedQuestions: string[] = []
              if (relatedMatch) {
                relatedQuestions = relatedMatch[1].split('\n').map(q => q.trim()).filter(q => q.length > 0 && !q.startsWith('---'))
              }
              const cleanText = assistantMessage.replace(/---RELATED_QUESTIONS---[\s\S]*?---END_RELATED_QUESTIONS---/g, '').trim()
              setMessages(prev => {
                const newMessages = [...prev]
                newMessages[newMessages.length - 1] = { role: 'assistant', content: cleanText, thinking: thinkingText, relatedQuestions }
                return newMessages
              })
            }
          } catch (e) {
            console.error('Parse error:', e, line)
          }
        }
      }
      setThinking('')
    } catch (error: unknown) {
      const err = error as Error
      const errorMsg = err.message || 'エラーが発生しました。もう一度お試しください。'
      setMessages(prev => {
        if (prev.length > 0 && prev[prev.length - 1].role === 'assistant' && !prev[prev.length - 1].content) {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = { role: 'assistant', content: `⚠️ ${errorMsg}` }
          return newMessages
        }
        return [...prev, { role: 'assistant', content: `⚠️ ${errorMsg}` }]
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages, input, setInput, isLoading, thinking, userInfo, sampleTweets,
    uploadedFiles, uploadedPreviews, randomSuggestions,
    handleFileUpload, removeFile, sendMessage
  }
}

export function useUserList(userId: string, userSearch: string) {
  const [userList, setUserList] = useState<UserOption[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (userId) return
    
    const fetchUsers = async () => {
      setLoadingUsers(true)
      try {
        const res = await fetch(`/api/hikamer-dx/chat/users?q=${encodeURIComponent(userSearch)}`)
        if (res.ok) {
          const data = await res.json()
          setUserList(data.users || [])
        }
      } catch (e) {
        console.error('Failed to fetch users:', e)
      }
      setLoadingUsers(false)
    }
    
    const timer = setTimeout(fetchUsers, 300)
    return () => clearTimeout(timer)
  }, [userId, userSearch])

  return { userList, loadingUsers }
}
