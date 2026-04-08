'use client'

import { UserInfo } from '../types'
import { handleImageError } from '../utils'
import styles from '../chat.module.css'

interface WelcomeScreenProps {
  userId: string
  userInfo: UserInfo
  suggestions: string[]
  setInput: (v: string) => void
}

export function WelcomeScreen({ userId, userInfo, suggestions, setInput }: WelcomeScreenProps) {
  return (
    <div className={styles.welcome}>
      <img 
        src={userInfo.profileImageUrl || '/default-avatar.png'} 
        alt={userInfo.userName}
        className={styles.welcomeAvatar}
        onError={handleImageError}
      />
      <h2>{userInfo.userName} になりきりAI</h2>
      <p className={styles.welcomeDesc}>@{userId} のツイートを学習したAIです</p>
      {userInfo.description && (
        <p className={styles.bio}>「{userInfo.description}」</p>
      )}
      <div className={styles.suggestions}>
        <p>話しかけてみよう:</p>
        {suggestions.map((text, i) => (
          <button key={i} type="button" onClick={() => setInput(text)}>{text}</button>
        ))}
      </div>
    </div>
  )
}
