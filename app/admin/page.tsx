'use client'

import { useState, useEffect } from 'react'
import styles from './admin.module.css'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/admin/auth')
      const data = await res.json()
      setAuthenticated(data.authenticated)
      setLoading(false)
    }
    checkAuth()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) {
      setAuthenticated(true)
    } else {
      setError('ログインに失敗しました')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    setAuthenticated(false)
  }

  if (loading) return <div className={styles.container}>読み込み中...</div>

  if (!authenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <h1>管理者ログイン</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="ユーザー名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
            />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.loginBtn}>
              ログイン
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>管理</h1>
        <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
          ログアウト
        </button>
      </header>
      <p style={{ color: 'var(--text-secondary)', marginTop: '24px' }}>
        現在、ここから利用できる管理機能はありません。
      </p>
    </div>
  )
}
