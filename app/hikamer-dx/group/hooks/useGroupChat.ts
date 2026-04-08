'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Participant, Message, UserOption } from '../types'
import { useTTS } from '../../../hooks/useTTS'

export function useGroupChat() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null)
  const [isSetup, setIsSetup] = useState(true)
  const [userList, setUserList] = useState<UserOption[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [autoPlayInterval, setAutoPlayInterval] = useState(15)
  const [customPrompt, setCustomPrompt] = useState('')
  
  const { isSpeaking, speak, stop, voices } = useTTS()
  const [autoSpeak, setAutoSpeak] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ユーザー一覧を取得
  useEffect(() => {
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
  }, [userSearch])

  const addParticipant = useCallback((user: UserOption) => {
    setParticipants(prev => {
      if (prev.find(p => p.userId === user.userId)) return prev
      const usedVoices = prev.map(p => p.voiceURI).filter(Boolean)
      const availableVoice = voices.find(v => !usedVoices.includes(v.voiceURI))?.voiceURI || voices[0]?.voiceURI
      
      return [...prev, {
        id: `ai-${user.userId}`,
        userId: user.userId,
        userName: user.userName,
        profileImageUrl: user.profileImageUrl,
        allProfileImages: user.allProfileImages,
        voiceURI: availableVoice
      }]
    })
  }, [voices])
  
  const removeParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id))
  }, [])
  
  const updateParticipantVoice = useCallback((id: string, voiceURI: string) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, voiceURI } : p))
  }, [])

  const makeAiSpeak = useCallback(async (participantId: string, context?: string) => {
    const participant = participants.find(p => p.id === participantId)
    if (!participant || isLoading) return
    
    setIsLoading(true)
    setCurrentSpeaker(participantId)
    
    try {
      const historyText = messages.slice(-20).map(m => {
        const p = participants.find(pp => pp.id === m.participantId)
        return `${p?.userName || '???'}: ${m.content}`
      }).join('\n')
      
      const otherParticipants = participants
        .filter(p => p.id !== participantId)
        .map(p => p.userName)
        .join('、')
      
      const res = await fetch('/api/hikamer-dx/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: participant.userId,
          message: context || '（グループチャットで自然に会話に参加してください）',
          history: [],
          systemPrompt: `グループチャット参加中。他参加者:${otherParticipants}${customPrompt ? ` 指示:${customPrompt}` : ''}
会話:${historyText}
短く自然に返答。`
        })
      })
      
      if (!res.ok) throw new Error('Failed')
      
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')
      
      const decoder = new TextDecoder()
      let content = ''
      let thinking = ''
      let sseBuffer = ''
      
      const newMsg: Message = { participantId, content: '', thinking: '', timestamp: new Date() }
      setMessages(prev => [...prev, newMsg])
      
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
            if (data.thinking || data.thought) thinking += data.thinking || data.thought
            if (data.text) {
              content += data.text
              setMessages(prev => {
                const newMsgs = [...prev]
                newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], content, thinking }
                return newMsgs
              })
            }
          } catch (e) {}
        }
      }
      
      if (autoSpeak && content) speak(content, participant.voiceURI)
    } catch (error) {
      console.error('AI speak error:', error)
    } finally {
      setIsLoading(false)
      setCurrentSpeaker(null)
    }
  }, [participants, messages, isLoading, autoSpeak, speak, customPrompt])
  
  const triggerAutoPlay = useCallback(() => {
    if (isLoading || participants.length === 0) return
    
    const lastMsg = messages[messages.length - 1]
    const candidates = participants.filter(p => p.id !== lastMsg?.participantId)
    
    let selected: Participant | null = null
    if (candidates.length > 0) {
      selected = candidates[Math.floor(Math.random() * candidates.length)]
    } else if (participants.length > 0) {
      selected = participants[Math.floor(Math.random() * participants.length)]
    }
    
    if (selected) makeAiSpeak(selected.id)
  }, [participants, messages, isLoading, makeAiSpeak])

  // 自動再生タイマー
  useEffect(() => {
    if (isSetup || participants.length === 0) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current)
      return
    }
    
    if (autoPlay && !isLoading) {
      autoPlayTimerRef.current = setInterval(triggerAutoPlay, autoPlayInterval * 1000)
    } else {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current)
    }
    
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current)
    }
  }, [isSetup, autoPlay, isLoading, autoPlayInterval, participants, triggerAutoPlay])
  
  const sendHumanMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const newMsg: Message = { participantId: 'human', content: input.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    
    if (!autoPlay && participants.length > 0) {
      setTimeout(() => {
        const responder = participants[Math.floor(Math.random() * participants.length)]
        makeAiSpeak(responder.id, newMsg.content)
      }, 500)
    }
  }, [input, isLoading, autoPlay, participants, makeAiSpeak])
  
  const startChat = useCallback(() => {
    if (participants.length < 2) {
      alert('2人以上の参加者が必要です')
      return
    }
    setIsSetup(false)
  }, [participants.length])

  return {
    participants, messages, input, setInput, isLoading, currentSpeaker,
    isSetup, setIsSetup, userList, userSearch, setUserSearch, loadingUsers,
    autoPlay, setAutoPlay, autoPlayInterval, setAutoPlayInterval,
    customPrompt, setCustomPrompt, isSpeaking, speak, stop, voices,
    autoSpeak, setAutoSpeak, messagesEndRef,
    addParticipant, removeParticipant, updateParticipantVoice,
    makeAiSpeak, triggerAutoPlay, sendHumanMessage, startChat
  }
}
