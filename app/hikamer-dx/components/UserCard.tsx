'use client'

import { useRouter } from 'next/navigation'
import { HikamerUser, SortKey } from '../types'
import { getValue, handleImageError } from '../utils'
import styles from '../hikamer-dx.module.css'

interface UserCardProps {
  user: HikamerUser
  index: number
  size?: 'large' | 'medium' | 'small'
  sortBy: SortKey
}

export function UserCard({ user, index, size = 'small', sortBy }: UserCardProps) {
  const router = useRouter()
  
  return (
    <div
      className={`${styles.userCard} ${styles[size]}`}
      title={`${user.userName} (@${user.userId})\n❤️ ${user.totalLikes.toLocaleString()} 🔁 ${user.totalRts.toLocaleString()} 👁 ${user.totalViews.toLocaleString()}`}
    >
      <div className={styles.rank}>{index + 1}</div>
      <a
        href={`https://x.com/${user.userId.replace('@', '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.avatarLink}
      >
        <img
          src={user.profileImageUrl || '/default-avatar.png'}
          alt={user.userName}
          className={styles.avatar}
          data-images={JSON.stringify(user.allProfileImages || [])}
          data-index="0"
          onError={handleImageError}
        />
      </a>
      {size !== 'small' && (
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user.userName}</div>
          <div className={styles.userId}>@{user.userId}</div>
          <div className={styles.stats}>{getValue(user, sortBy).toLocaleString()}</div>
        </div>
      )}
      <button
        className={styles.chatBtn}
        onClick={(e) => {
          e.stopPropagation()
          router.push(`/hikamer-dx/chat?user=${encodeURIComponent(user.userId)}`)
        }}
        title={`${user.userName}になりきりAIと話す`}
      >
        💬
      </button>
    </div>
  )
}

interface ListItemProps {
  user: HikamerUser
  index: number
  sortBy: SortKey
}

export function ListItem({ user, index, sortBy }: ListItemProps) {
  const router = useRouter()
  
  return (
    <div className={styles.listItem}>
      <span className={styles.listRank}>{index + 1}</span>
      <a href={`https://x.com/${user.userId.replace('@', '')}`} target="_blank" rel="noopener noreferrer" title={`@${user.userId}のプロフィール`}>
        <img 
          src={user.profileImageUrl || '/default-avatar.png'} 
          alt="" 
          className={styles.listAvatar} 
          data-images={JSON.stringify(user.allProfileImages || [])} 
          data-index="0" 
          onError={handleImageError} 
        />
      </a>
      <div className={styles.listInfo}>
        <span className={styles.listName}>{user.userName}</span>
        <span className={styles.listId}>@{user.userId}</span>
      </div>
      <span className={styles.listValue}>{getValue(user, sortBy).toLocaleString()}</span>
      <button
        className={styles.listChatBtn}
        onClick={() => router.push(`/hikamer-dx/chat?user=${encodeURIComponent(user.userId)}`)}
        title={`${user.userName}になりきりAIと話す`}
      >
        💬
      </button>
    </div>
  )
}
