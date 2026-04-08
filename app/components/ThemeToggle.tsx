'use client'

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
    const [showMenu, setShowMenu] = useState(false)
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
        if (savedTheme) {
            setTheme(savedTheme)
            applyTheme(savedTheme)
        }

        // 実際に適用されているテーマを検出
        const detectTheme = () => {
            const dataTheme = document.documentElement.getAttribute('data-theme')
            if (dataTheme === 'light' || dataTheme === 'dark') {
                setCurrentTheme(dataTheme)
            } else {
                // システム設定を確認
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                setCurrentTheme(isDark ? 'dark' : 'light')
            }
        }

        detectTheme()

        // テーマ変更を監視
        const observer = new MutationObserver(detectTheme)
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

        // システムテーマ変更を監視
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => detectTheme()
        mediaQuery.addEventListener('change', handleChange)

        return () => {
            observer.disconnect()
            mediaQuery.removeEventListener('change', handleChange)
        }
    }, [])

    const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
        if (newTheme === 'system') {
            document.documentElement.removeAttribute('data-theme')
        } else {
            document.documentElement.setAttribute('data-theme', newTheme)
        }
    }

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        applyTheme(newTheme)
        setShowMenu(false)
    }

    // 現在のテーマに基づいた色を取得
    const getColors = () => {
        if (currentTheme === 'light') {
            return {
                bgPrimary: '#ffffff',
                bgSecondary: '#f8f9fa',
                textPrimary: '#202124',
                textSecondary: '#5f6368',
                borderColor: '#dadce0',
                linkColor: '#1a0dab',
                hoverBg: '#f1f3f4'
            }
        } else {
            return {
                bgPrimary: '#202124',
                bgSecondary: '#303134',
                textPrimary: '#e8eaed',
                textSecondary: '#9aa0a6',
                borderColor: '#5f6368',
                linkColor: '#8ab4f8',
                hoverBg: '#3c4043'
            }
        }
    }

    const colors = getColors()

    const getIcon = () => {
        if (theme === 'light') {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
                </svg>
            )
        } else if (theme === 'dark') {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z" />
                </svg>
            )
        } else {
            return (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
                </svg>
            )
        }
    }

    if (!mounted) {
        return null
    }

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'background-color 0.2s, border-color 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
                    e.currentTarget.style.borderColor = 'var(--text-secondary)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                }}
                title="テーマ切り替え"
            >
                {getIcon()}
            </button>
            {showMenu && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        left: 'auto',
                        backgroundColor: colors.bgPrimary,
                        border: `1px solid ${colors.borderColor}`,
                        borderRadius: '8px',
                        padding: '8px 0',
                        minWidth: '150px',
                        maxWidth: 'calc(100vw - 32px)',
                        zIndex: 100,
                        boxShadow: currentTheme === 'light' ? '0 4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.5)',
                        marginTop: '4px'
                    }}
                >
                    <div
                        onClick={() => handleThemeChange('light')}
                        style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            color: theme === 'light' ? colors.linkColor : colors.textPrimary,
                            backgroundColor: 'transparent',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBg}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {theme === 'light' && <span>✓</span>}
                        ライトモード
                    </div>
                    <div
                        onClick={() => handleThemeChange('dark')}
                        style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            color: theme === 'dark' ? colors.linkColor : colors.textPrimary,
                            backgroundColor: 'transparent',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBg}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {theme === 'dark' && <span>✓</span>}
                        ダークモード
                    </div>
                    <div
                        onClick={() => handleThemeChange('system')}
                        style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            color: theme === 'system' ? colors.linkColor : colors.textPrimary,
                            backgroundColor: 'transparent',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBg}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {theme === 'system' && <span>✓</span>}
                        システム設定
                    </div>
                </div>
            )}
        </div>
    )
}
