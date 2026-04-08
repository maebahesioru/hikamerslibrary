'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import styles from './battle.module.css'
import { useTTS } from '../../hooks/useTTS'

interface UserOption {
  userId: string
  userName: string
  profileImageUrl: string
  allProfileImages: string[]
  tweetCount: number
}

interface BattleResult {
  text: string
  thinking: string
}

function BattleContent() {
  // モード選択
  const [mode, setMode] = useState<'battle' | 'manzai' | 'conte' | 'rap' | 'debate' | 'drama'>('battle')
  
  // チーム選択
  const [teamA, setTeamA] = useState<UserOption[]>([])
  const [teamB, setTeamB] = useState<UserOption[]>([])
  const [note, setNote] = useState('')
  
  // バトル中
  const [battleStarted, setBattleStarted] = useState(false)
  const [battleResult, setBattleResult] = useState<BattleResult>({ text: '', thinking: '' })
  const [isLoading, setIsLoading] = useState(false)
  
  // ユーザー選択
  const [userList, setUserList] = useState<UserOption[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectingFor, setSelectingFor] = useState<'A' | 'B' | null>(null)
  
  // TTS読み上げ
  const { isSpeaking, speak, stop, voices, selectedVoice, setSelectedVoice } = useTTS()
  
  const speakBattle = () => {
    if (!battleResult.text) return
    speak(battleResult.text)
  }
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
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
  
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const allImages = JSON.parse(img.dataset.images || '[]')
    let idx = parseInt(img.dataset.index || '0') + 1
    while (idx < allImages.length) {
      const nextUrl = allImages[idx]
      if (nextUrl && nextUrl !== img.src) {
        img.dataset.index = idx.toString()
        img.src = nextUrl
        return
      }
      idx++
    }
    img.src = '/default-avatar.png'
  }
  
  const addToTeam = (user: UserOption, team: 'A' | 'B') => {
    if (team === 'A' && teamA.length < 5 && !teamA.find(u => u.userId === user.userId)) {
      setTeamA([...teamA, user])
    } else if (team === 'B' && teamB.length < 5 && !teamB.find(u => u.userId === user.userId)) {
      setTeamB([...teamB, user])
    }
    setSelectingFor(null)
  }
  
  const addRandomToTeam = async (team: 'A' | 'B') => {
    try {
      const res = await fetch('/api/hikamer-dx?action=random')
      if (res.ok) {
        const data = await res.json()
        if (data.userId) {
          const user: UserOption = {
            userId: data.userId,
            userName: data.userName,
            profileImageUrl: data.profileImageUrl,
            allProfileImages: [],
            tweetCount: 0
          }
          // 既に追加済みでないか確認
          if (!teamA.find(u => u.userId === user.userId) && !teamB.find(u => u.userId === user.userId)) {
            if (team === 'A' && teamA.length < 5) {
              setTeamA(prev => [...prev, user])
            } else if (team === 'B' && teamB.length < 5) {
              setTeamB(prev => [...prev, user])
            }
          } else {
            // 既に追加済みなら再試行
            addRandomToTeam(team)
          }
        }
      }
    } catch (e) {
      console.error('Failed to add random user:', e)
    }
  }
  
  const removeFromTeam = (userId: string, team: 'A' | 'B') => {
    if (team === 'A') {
      setTeamA(teamA.filter(u => u.userId !== userId))
    } else {
      setTeamB(teamB.filter(u => u.userId !== userId))
    }
  }
  
  const startBattle = async () => {
    if (teamA.length === 0 || teamB.length === 0) return
    
    setBattleStarted(true)
    setIsLoading(true)
    setBattleResult({ text: '', thinking: '' })
    
    try {
      const res = await fetch('/api/hikamer-dx/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamA: teamA.map(u => u.userId),
          teamB: teamB.map(u => u.userId),
          note: note.trim(),
          mode
        })
      })
      
      if (!res.ok) throw new Error('Battle failed')
      
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')
      
      const decoder = new TextDecoder()
      let sseBuffer = ''
      let text = ''
      let thinking = ''
      
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
            
            if (data.thinking || data.thought) {
              thinking += data.thinking || data.thought
              setBattleResult({ text, thinking })
            }
            if (data.text) {
              text += data.text
              setBattleResult({ text, thinking })
            }
          } catch (e) {
            console.error('Parse error:', e)
          }
        }
      }
    } catch (error) {
      console.error('Battle error:', error)
      setBattleResult({ text: 'エラーが発生しました', thinking: '' })
    } finally {
      setIsLoading(false)
    }
  }
  
  const resetBattle = () => {
    setBattleStarted(false)
    setBattleResult({ text: '', thinking: '' })
  }
  
  // ユーザー選択モーダル
  if (selectingFor) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button type="button" onClick={() => setSelectingFor(null)} className={styles.backBtn}>
            ← 戻る
          </button>
          <span className={styles.headerTitle}>
            チーム{selectingFor}にユーザーを追加
          </span>
        </header>
        
        <div className={styles.selectArea}>
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
                  onClick={() => addToTeam(user, selectingFor)}
                  disabled={
                    (selectingFor === 'A' && (teamA.length >= 5 || teamA.find(u => u.userId === user.userId) !== undefined)) ||
                    (selectingFor === 'B' && (teamB.length >= 5 || teamB.find(u => u.userId === user.userId) !== undefined))
                  }
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
                    <span className={styles.optionCount}>📝{user.tweetCount.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // バトル画面
  if (battleStarted) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button type="button" onClick={resetBattle} className={styles.backBtn}>
            ← 戻る
          </button>
          <span className={styles.headerTitle}>⚔️ バトル</span>
        </header>
        
        <div className={styles.battleArea}>
          <div className={styles.teamsHeader}>
            <div className={styles.teamHeader}>
              {teamA.map(u => (
                <img key={u.userId} src={u.profileImageUrl} alt={u.userName} className={styles.teamAvatar} onError={handleImageError} />
              ))}
            </div>
            <span className={styles.vs}>VS</span>
            <div className={styles.teamHeader}>
              {teamB.map(u => (
                <img key={u.userId} src={u.profileImageUrl} alt={u.userName} className={styles.teamAvatar} onError={handleImageError} />
              ))}
            </div>
          </div>
          
          <div className={styles.messagesArea}>
            {battleResult.thinking && (
              <details className={styles.thinkingDetails} open={isLoading}>
                <summary>🤔 推論過程</summary>
                <div className={styles.thinkingContent}>
                  <ReactMarkdown>{battleResult.thinking}</ReactMarkdown>
                </div>
              </details>
            )}
            
            <div className={styles.battleText}>
              {battleResult.text ? (
                <ReactMarkdown>{battleResult.text}</ReactMarkdown>
              ) : isLoading ? (
                <div className={styles.loading}>バトル生成中...</div>
              ) : null}
            </div>
            
            {battleResult.text && !isLoading && (
              <div className={styles.battleActions}>
                <button
                  type="button"
                  onClick={isSpeaking ? stop : speakBattle}
                  className={styles.speakBtn}
                >
                  {isSpeaking ? '⏹️ 停止' : '🔊 読み上げ'}
                </button>
                {voices.length > 0 && (
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
                )}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    )
  }
  
  const modeLabels = {
    battle: '⚔️ バトル',
    manzai: '🎤 漫才',
    conte: '🎭 コント',
    rap: '🎵 ラップバトル',
    debate: '💬 ディベート',
    drama: '🎬 ドラマ'
  }
  
  const modeDescriptions = {
    battle: '物理的な戦闘シーン！必殺技や覚醒で熱いバトル',
    manzai: 'ボケとツッコミの掛け合い漫才',
    conte: 'シチュエーションコメディ',
    rap: '韻を踏んだラップバトル',
    debate: '論理的な議論対決',
    drama: '感動のドラマストーリー'
  }

  // チーム編成画面
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.headerTitle}>⚔️ なりきりAIバトル</span>
        <div className={styles.headerLinks}>
          <Link href="/hikamer-dx/chat" className={styles.headerLink}>💬 チャット</Link>
          <Link href="/hikamer-dx/group" className={styles.headerLink}>👥 グループ</Link>
          <Link href="/hikamer-dx" className={styles.headerLink}>📊 ヒカマー表DX</Link>
        </div>
      </header>
      
      <div className={styles.setupArea}>
        <h2>なりきりAI創作</h2>
        <p className={styles.setupDesc}>最大5vs5でAIがなりきり創作！</p>
        
        <div className={styles.modeSelector}>
          {(Object.keys(modeLabels) as Array<keyof typeof modeLabels>).map(m => (
            <button
              key={m}
              type="button"
              className={`${styles.modeBtn} ${mode === m ? styles.modeBtnActive : ''}`}
              onClick={() => setMode(m)}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>
        <p className={styles.modeDesc}>{modeDescriptions[mode]}</p>
        
        <div className={styles.teamsSetup}>
          <div className={styles.teamSetup}>
            <h3>チームA ({teamA.length}/5)</h3>
            <div className={styles.teamMembers}>
              {teamA.map(user => (
                <div key={user.userId} className={styles.teamMember}>
                  <img src={user.profileImageUrl} alt={user.userName} className={styles.memberAvatar} onError={handleImageError} />
                  <span>{user.userName}</span>
                  <button type="button" onClick={() => removeFromTeam(user.userId, 'A')} className={styles.removeBtn}>×</button>
                </div>
              ))}
              {teamA.length < 5 && (
                <>
                  <button type="button" onClick={() => setSelectingFor('A')} className={styles.addBtn}>+ 追加</button>
                  <button type="button" onClick={() => addRandomToTeam('A')} className={styles.randomBtn}>🎲 ランダム</button>
                </>
              )}
            </div>
          </div>
          
          <div className={styles.vsCenter}>VS</div>
          
          <div className={styles.teamSetup}>
            <h3>チームB ({teamB.length}/5)</h3>
            <div className={styles.teamMembers}>
              {teamB.map(user => (
                <div key={user.userId} className={styles.teamMember}>
                  <img src={user.profileImageUrl} alt={user.userName} className={styles.memberAvatar} onError={handleImageError} />
                  <span>{user.userName}</span>
                  <button type="button" onClick={() => removeFromTeam(user.userId, 'B')} className={styles.removeBtn}>×</button>
                </div>
              ))}
              {teamB.length < 5 && (
                <>
                  <button type="button" onClick={() => setSelectingFor('B')} className={styles.addBtn}>+ 追加</button>
                  <button type="button" onClick={() => addRandomToTeam('B')} className={styles.randomBtn}>🎲 ランダム</button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.topicArea}>
          <label>追加の指示（任意）</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例: 舞台は渋谷、ギャグ多め、シリアス展開で"
            className={styles.topicInput}
          />
        </div>
        
        <button
          type="button"
          onClick={startBattle}
          disabled={teamA.length === 0 || teamB.length === 0}
          className={styles.startBtn}
        >
          {modeLabels[mode]} 開始
        </button>
      </div>
    </div>
  )
}

export default function BattlePage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>}>
      <BattleContent />
    </Suspense>
  )
}
