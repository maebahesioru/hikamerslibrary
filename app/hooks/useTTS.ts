'use client'

import { useState, useEffect, useCallback } from 'react'

export interface TTSVoice {
  name: string
  lang: string
  voiceURI: string
}

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<TTSVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  
  // 利用可能な音声を取得
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      // 日本語音声を優先、その他も含める
      const voiceList = availableVoices.map(v => ({
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI
      }))
      
      // 日本語を先頭に
      const jaVoices = voiceList.filter(v => v.lang.startsWith('ja'))
      const otherVoices = voiceList.filter(v => !v.lang.startsWith('ja'))
      setVoices([...jaVoices, ...otherVoices])
      
      // デフォルトは日本語音声
      if (!selectedVoice && jaVoices.length > 0) {
        setSelectedVoice(jaVoices[0].voiceURI)
      }
    }
    
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [selectedVoice])
  
  const speak = useCallback((text: string, voiceURI?: string) => {
    if (!text || isSpeaking) return
    if (!('speechSynthesis' in window)) {
      alert('お使いのブラウザは音声合成に対応していません。')
      return
    }
    
    // Markdownを除去
    const plainText = text
      .replace(/[#*_`~\[\]()]/g, '')
      .replace(/\n+/g, '\n')
      .trim()
    
    const utterance = new SpeechSynthesisUtterance(plainText)
    
    // 指定された音声または選択された音声を設定
    const targetVoice = voiceURI || selectedVoice
    if (targetVoice) {
      const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === targetVoice)
      if (voice) {
        utterance.voice = voice
        utterance.lang = voice.lang
      }
    } else {
      utterance.lang = 'ja-JP'
    }
    
    utterance.rate = 1.0
    utterance.pitch = 1.0
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    window.speechSynthesis.speak(utterance)
  }, [isSpeaking, selectedVoice])
  
  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])
  
  return { 
    isSpeaking, 
    speak, 
    stop, 
    voices, 
    selectedVoice, 
    setSelectedVoice 
  }
}
