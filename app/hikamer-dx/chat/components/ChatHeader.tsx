'use client'

import { useRouter } from 'next/navigation'
import { UserInfo } from '../types'
import { handleImageError } from '../utils'
import styles from '../chat.module.css'
import type { TTSVoice } from '../../../hooks/useTTS'

interface ChatHeaderProps {
  userId: string
  userInfo: UserInfo | null
  voices: TTSVoice[]
  selectedVoice: string
  setSelectedVoice: (v: string) => void
}

export function ChatHeader({ userId, userInfo, voices, selectedVoice, setSelectedVoice }: ChatHeaderProps) {
  const router = useRouter()
  
  return (
    <header className={styles.header}>
      <button type="button" onClick={() => router.push('/hikamer-dx/chat')} className={styles.backBtn}>
        ← 戻る
      </button>
      <div className={styles.userHeader}>
        {userInfo && (
          <>
            <img 
              src={userInfo.profileImageUrl || '/default-avatar.png'} 
              alt={userInfo.userName}
              className={styles.headerAvatar}
              onError={handleImageError}
            />
            <div className={styles.headerInfo}>
              <span className={styles.headerName}>{userInfo.userName}</span>
              <span className={styles.headerId}>@{userId} になりきりAI</span>
            </div>
          </>
        )}
      </div>
      {voices.length > 0 && (
        <div className={styles.voiceSelector}>
          <span className={styles.voiceLabel}>🔊</span>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className={styles.voiceSelect}
            title="読み上げ音声を選択"
          >
            {voices.map(v => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name.replace(/Microsoft |Google /, '')}
              </option>
            ))}
          </select>
        </div>
      )}
    </header>
  )
}
