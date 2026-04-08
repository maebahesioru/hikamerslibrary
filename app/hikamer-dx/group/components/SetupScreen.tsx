'use client'

import Link from 'next/link'
import { Participant, UserOption } from '../types'
import { TTSVoice } from '../../../hooks/useTTS'
import styles from '../group.module.css'

interface SetupScreenProps {
  participants: Participant[]
  userList: UserOption[]
  userSearch: string
  setUserSearch: (v: string) => void
  loadingUsers: boolean
  customPrompt: string
  setCustomPrompt: (v: string) => void
  autoSpeak: boolean
  setAutoSpeak: (v: boolean) => void
  voices: TTSVoice[]
  addParticipant: (user: UserOption) => void
  removeParticipant: (id: string) => void
  updateParticipantVoice: (id: string, voiceURI: string) => void
  startChat: () => void
}

function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.src = '/default-avatar.png'
}

export function SetupScreen({
  participants, userList, userSearch, setUserSearch, loadingUsers,
  customPrompt, setCustomPrompt, autoSpeak, setAutoSpeak, voices,
  addParticipant, removeParticipant, updateParticipantVoice, startChat
}: SetupScreenProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.headerTitle}>👥 グループチャット</span>
        <div className={styles.headerLinks}>
          <Link href="/hikamer-dx/chat" className={styles.headerLink}>💬 1対1チャット</Link>
          <Link href="/hikamer-dx/battle" className={styles.headerLink}>⚔️ バトル</Link>
          <Link href="/hikamer-dx" className={styles.headerLink}>📊 ヒカマー表DX</Link>
        </div>
      </header>
      
      <div className={styles.setupArea}>
        <h2>グループチャットを作成</h2>
        <p className={styles.setupDesc}>最大10人のAI＋人間でグループチャット！自動再生でAI同士が勝手に会話します</p>
        
        <div className={styles.participantsSection}>
          <h3>参加者 ({participants.length}人)</h3>
          <div className={styles.participantsList}>
            {participants.map(p => (
              <div key={p.id} className={styles.participantCard}>
                <img src={p.profileImageUrl} alt="" className={styles.participantAvatar} onError={handleImageError} />
                <div className={styles.participantInfo}>
                  <span className={styles.participantName}>{p.userName}</span>
                  <select
                    value={p.voiceURI || ''}
                    onChange={(e) => updateParticipantVoice(p.id, e.target.value)}
                    className={styles.voiceSelectSmall}
                    title="読み上げ音声"
                  >
                    {voices.map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name.replace(/Microsoft |Google /, '')}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={() => removeParticipant(p.id)} className={styles.removeBtn}>×</button>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.addAiSection}>
          <h3>AIを追加</h3>
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
            <>
              <button
                type="button"
                className={styles.addAllBtn}
                onClick={() => userList.forEach(user => addParticipant(user))}
              >
                ➕ 全員追加（{userList.filter(u => !participants.some(p => p.userId === u.userId)).length}人）
              </button>
              <div className={styles.userGrid}>
                {userList.slice(0, 20).map(user => (
                  <button
                    key={user.userId}
                    type="button"
                    className={styles.userOption}
                    onClick={() => addParticipant(user)}
                    disabled={participants.some(p => p.userId === user.userId)}
                  >
                    <img src={user.profileImageUrl || '/default-avatar.png'} alt="" className={styles.optionAvatar} onError={handleImageError} />
                    <span className={styles.optionName}>{user.userName}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className={styles.settingsSection}>
          <h3>設定</h3>
          <div className={styles.promptSection}>
            <label className={styles.promptLabel}>💬 会話の指示（任意）</label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="例: ラジオ番組風に会話して / レスバして / 敬語禁止 / 関西弁で話して"
              className={styles.promptInput}
              rows={3}
            />
          </div>
          <label className={styles.settingRow}>
            <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} />
            自動読み上げ（ラジオモード）
          </label>
        </div>
        
        <button type="button" onClick={startChat} disabled={participants.length < 2} className={styles.startBtn}>
          💬 チャット開始
        </button>
      </div>
    </div>
  )
}
