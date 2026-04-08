'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserOption } from '../types'
import { handleImageError } from '../utils'
import styles from '../chat.module.css'

interface UserSelectProps {
  userSearch: string
  setUserSearch: (v: string) => void
  userList: UserOption[]
  loadingUsers: boolean
}

export function UserSelect({ userSearch, setUserSearch, userList, loadingUsers }: UserSelectProps) {
  const router = useRouter()
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.userHeader}>
          <span className={styles.headerName}>💬 なりきりAIチャット</span>
        </div>
        <div className={styles.headerLinks}>
          <Link href="/hikamer-dx/group" className={styles.headerLink}>👥 グループ</Link>
          <Link href="/hikamer-dx/battle" className={styles.headerLink}>⚔️ バトル</Link>
          <Link href="/hikamer-dx" className={styles.headerLink}>📊 ヒカマー表DX</Link>
        </div>
      </header>
      
      <div className={styles.selectArea}>
        <h2>話したいユーザーを選んでください</h2>
        <p className={styles.selectDesc}>ユーザーのツイートを学習したAIと会話できます</p>
        
        <input
          type="text"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          placeholder="🔍 ユーザーを検索..."
          className={styles.searchInput}
        />
        
        {loadingUsers ? (
          <div className={styles.loading}>読み込み中...</div>
        ) : (
          <div className={styles.userGrid}>
            {userList.map(user => (
              <button
                key={user.userId}
                type="button"
                className={styles.userOption}
                onClick={() => router.push(`/hikamer-dx/chat?user=${encodeURIComponent(user.userId)}`)}
              >
                <img 
                  src={user.profileImageUrl || '/default-avatar.png'} 
                  alt={user.userName}
                  className={styles.optionAvatar}
                  data-images={JSON.stringify(user.allProfileImages || [])}
                  data-index="0"
                  onError={handleImageError}
                />
                <div className={styles.optionInfo}>
                  <span className={styles.optionName}>{user.userName}</span>
                  <span className={styles.optionId}>@{user.userId}</span>
                  <span className={styles.optionCount}>{user.tweetCount.toLocaleString()}件のツイート</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
