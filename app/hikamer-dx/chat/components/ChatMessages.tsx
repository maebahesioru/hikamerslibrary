'use client'

import ReactMarkdown from 'react-markdown'
import { Message, UserInfo } from '../types'
import { handleImageError } from '../utils'
import styles from '../chat.module.css'

interface ChatMessagesProps {
  messages: Message[]
  userInfo: UserInfo | null
  isLoading: boolean
  isSpeaking: boolean
  speak: (text: string) => void
  stop: () => void
  setInput: (v: string) => void
}

export function ChatMessages({ messages, userInfo, isLoading, isSpeaking, speak, stop, setInput }: ChatMessagesProps) {
  return (
    <>
      {messages.map((msg, i) => (
        <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
          {msg.role === 'assistant' && userInfo && (
            <img 
              src={userInfo.profileImageUrl || '/default-avatar.png'} 
              alt=""
              className={styles.messageAvatar}
              onError={handleImageError}
            />
          )}
          <div className={styles.messageContent}>
            {msg.mediaFiles && msg.mediaFiles.length > 0 && (
              <div className={styles.messageMedia}>
                {msg.mediaFiles.map((file, fi) => (
                  file.preview && file.mimeType.startsWith('image/') ? (
                    <img key={fi} src={file.preview} alt="" className={styles.mediaPreview} />
                  ) : file.mimeType.startsWith('video/') ? (
                    <video key={fi} src={file.preview} className={styles.mediaPreview} controls />
                  ) : (
                    <div key={fi} className={styles.mediaFile}>📎 {file.mimeType}</div>
                  )
                ))}
              </div>
            )}
            {msg.thinking && (
              <details className={styles.thinkingDetails}>
                <summary>🤔 推論過程</summary>
                <div className={styles.thinkingContent}>
                  <ReactMarkdown>{msg.thinking}</ReactMarkdown>
                </div>
              </details>
            )}
            {msg.role === 'assistant' ? (
              <>
                <ReactMarkdown>{msg.content || (isLoading && i === messages.length - 1 ? '...' : '')}</ReactMarkdown>
                {msg.content && !isLoading && (
                  <button
                    type="button"
                    onClick={() => isSpeaking ? stop() : speak(msg.content)}
                    className={styles.speakBtn}
                  >
                    {isSpeaking ? '⏹️' : '🔊'}
                  </button>
                )}
                {msg.relatedQuestions && msg.relatedQuestions.length > 0 && !isLoading && i === messages.length - 1 && (
                  <div className={styles.relatedQuestions}>
                    <div className={styles.relatedLabel}>関連</div>
                    {msg.relatedQuestions.map((q, qi) => (
                      <button
                        key={qi}
                        type="button"
                        className={styles.relatedBtn}
                        onClick={() => setInput(q)}
                      >
                        <span className={styles.relatedArrow}>↳</span>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              msg.content
            )}
          </div>
        </div>
      ))}
    </>
  )
}
