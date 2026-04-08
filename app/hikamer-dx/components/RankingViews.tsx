'use client'

import { HikamerUser, SortKey } from '../types'
import { UserCard, ListItem } from './UserCard'
import styles from '../hikamer-dx.module.css'

interface ViewProps {
  users: HikamerUser[]
  sortBy: SortKey
  dateLabel: string
  userFilter: string
  pyramidRef: React.RefObject<HTMLDivElement>
  onDownload: () => void
}

export function PodiumView({ users, sortBy, dateLabel, userFilter, pyramidRef, onDownload }: ViewProps) {
  return (
    <>
      <div className={styles.pyramidWrapper} ref={pyramidRef}>
        <div className={styles.pyramidTitle}>
          ヒカマー表 {dateLabel}{userFilter && ` (${users.length}件)`}
        </div>
        <div className={styles.podium}>
          {users[1] && <UserCard user={users[1]} index={1} size="large" sortBy={sortBy} />}
          {users[0] && <UserCard user={users[0]} index={0} size="large" sortBy={sortBy} />}
          {users[2] && <UserCard user={users[2]} index={2} size="large" sortBy={sortBy} />}
        </div>
        <div className={styles.topTen}>
          {users.slice(3, 10).map((user, i) => (
            <UserCard key={user.userId} user={user} index={i + 3} size="medium" sortBy={sortBy} />
          ))}
        </div>
        <div className={styles.grid}>
          {users.slice(10).map((user, i) => (
            <UserCard key={user.userId} user={user} index={i + 10} size="small" sortBy={sortBy} />
          ))}
        </div>
      </div>
      <button type="button" className={styles.downloadBtn} onClick={onDownload}>📥 画像をダウンロード</button>
    </>
  )
}

export function ListView({ users, sortBy, dateLabel, userFilter, pyramidRef, onDownload }: ViewProps) {
  return (
    <>
      <div className={styles.listWrapper} ref={pyramidRef}>
        <div className={styles.pyramidTitle}>
          ヒカマー表 {dateLabel}{userFilter && ` (${users.length}件)`}
        </div>
        <div className={styles.list}>
          {users.map((user, i) => (
            <ListItem key={user.userId} user={user} index={i} sortBy={sortBy} />
          ))}
        </div>
      </div>
      <button type="button" className={styles.downloadBtn} onClick={onDownload}>📥 画像をダウンロード</button>
    </>
  )
}

export function GridView({ users, sortBy, dateLabel, userFilter, pyramidRef, onDownload }: ViewProps) {
  return (
    <>
      <div className={styles.gridWrapper} ref={pyramidRef}>
        <div className={styles.pyramidTitle}>
          ヒカマー表 {dateLabel}{userFilter && ` (${users.length}件)`}
        </div>
        <div className={styles.grid}>
          {users.map((user, i) => (
            <UserCard key={user.userId} user={user} index={i} size="small" sortBy={sortBy} />
          ))}
        </div>
      </div>
      <button type="button" className={styles.downloadBtn} onClick={onDownload}>📥 画像をダウンロード</button>
    </>
  )
}
