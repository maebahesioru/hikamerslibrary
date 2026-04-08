'use client'

import { RefObject } from 'react'
import ReactMarkdown from 'react-markdown'
import { Participant, Message } from '../types'
import styles from '../group.module.css'

interface ChatScreenProps {
  participants: Participant[]
  messages: Message[]
  input: string
  setInput: (v: string) => void
  isLoading: boolean
  currentSpeaker: string | null
  autoPlay: boolean
  setAutoPlay: (v: boolean) => void
  autoPlayInterval: number
  setAutoPlayInterval: (v: number) => void
  autoSpeak: boolean
  setAutoSpeak: (v: boolean) => void
  isSpeaking: boolean
  speak: (text: string, voiceURI?: string) => void
  stop: () => void
  messagesEndRef: RefObject<HTMLDivElement>
  setIsSetup: (v: boolean) => void
  makeAiSpeak: (id: string) => void
  triggerAutoPlay: () => void
  sendHumanMessage: (e: React.FormEvent) => void
}

function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.src = '/default-avatar.png'
}

export function ChatScreen({
  participants, messages, input, setInput, isLoading, currentSpeaker,
  autoPlay, setAutoPlay, autoPlayInterval, setAutoPlayInterval,
  autoSpeak, setAutoSpeak, isSpeaking, speak, stop, messagesEndRef,
  setIsSetup, makeAiSpeak, triggerAutoPlay, sendHumanMessage
}: ChatScreenProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button type="button" onClick={() => setIsSetup(true)} className={styles.backBtn}>← 設定</button>
        <span className={styles.headerTitle}>👥 グループチャット</span>
        <div className={styles.headerControls}>
          <button
            type="button"
            onClick={() => setAutoPlay(!autoPlay)}
            className={`${styles.controlBtn} ${autoPlay ? styles.active : ''}`}
          >
            {autoPlay ? '⏸️ 停止' : '▶️ 自動再生'}
          </button>
          <button
            type="button"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`${styles.controlBtn} ${autoSpeak ? styles.active : ''}`}
          >
            {autoSpeak ? '🔇 読み上げOFF' : '🔊 読み上げON'}
          </button>
        </div>
      </header>
      
      <div className={styles.participantsBar}>
        {participants.map(p => (
          <div
            key={p.id}
            className={`${styles.participantBadge} ${currentSpeaker === p.id ? styles.speaking : ''}`}
            onClick={() => makeAiSpeak(p.id)}
            title="クリックで発言させる"
          >
            <img src={p.profileImageUrl} alt="" className={styles.badgeAvatar} onError={handleImageError} />
            <span>{p.userName}</span>
          </div>
        ))}
        
        {autoPlay && (
          <div className={styles.intervalSetting}>
            <input
              type="number"
              value={autoPlayInterval}
              onChange={(e) => setAutoPlayInterval(Math.max(5, parseInt(e.target.value) || 15))}
              min={5}
              max={60}
              className={styles.intervalInput}
              title="発言間隔（秒）"
              aria-label="発言間隔（秒）"
            />
            秒間隔
          </div>
        )}
      </div>
      
      <div className={styles.chatArea}>
        {messages.map((msg, i) => {
          const participant = participants.find(p => p.id === msg.participantId)
          const isHuman = msg.participantId === 'human'
          
          return (
            <div key={i} className={`${styles.message} ${isHuman ? styles.humanMsg : styles.aiMsg}`}>
              <img 
                src={participant?.profileImageUrl || '/default-avatar.png'} 
                alt="" 
                className={styles.msgAvatar} 
                onError={handleImageError} 
              />
              <div className={styles.msgContent}>
                <span className={styles.msgName}>{isHuman ? 'あなた' : participant?.userName || '???'}</span>
                {msg.thinking && (
                  <details className={styles.thinkingDetails}>
                    <summary>🤔</summary>
                    <div className={styles.thinkingContent}>{msg.thinking}</div>
                  </details>
                )}
                <div className={styles.msgText}>
                  <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                </div>
                {msg.content && (
                  <button
                    type="button"
                    onClick={() => isSpeaking ? stop() : speak(msg.content, participant?.voiceURI)}
                    className={styles.speakBtn}
                  >
                    {isSpeaking ? '⏹️' : '🔊'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendHumanMessage} className={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          disabled={isLoading}
          className={styles.input}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className={styles.sendBtn}>
          送信
        </button>
      </form>
      
      {!autoPlay && (
        <div className={styles.aiOnlyControls}>
          <button type="button" onClick={triggerAutoPlay} disabled={isLoading} className={styles.triggerBtn}>
            🎲 ランダムに発言させる
          </button>
        </div>
      )}
    </div>
  )
}
