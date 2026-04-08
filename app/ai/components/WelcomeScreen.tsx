import { useState } from 'react'

interface WelcomeScreenProps {
  searchQuery: string
  isListening: boolean
  onSearchQueryChange: (query: string) => void
  onVoiceInput: () => void
  onNavigate: (query: string) => void
}

export default function WelcomeScreen({ searchQuery, isListening, onSearchQueryChange, onVoiceInput, onNavigate }: WelcomeScreenProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedPreviews, setUploadedPreviews] = useState<string[]>([])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    const newFiles = [...uploadedFiles, ...files].slice(0, 5)
    setUploadedFiles(newFiles)
    
    const previews: string[] = []
    newFiles.forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        previews.push(URL.createObjectURL(file))
      } else if (file.type.startsWith('audio/')) {
        previews.push('audio')
      } else {
        previews.push('file')
      }
    })
    setUploadedPreviews(previews)
  }

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    const newPreviews = uploadedPreviews.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    setUploadedPreviews(newPreviews)
  }

  return (
    <div className="ai-welcome-screen" style={{
      width: '100%',
      padding: '40px 20px 40px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontSize: '36px',
          marginBottom: '12px',
          color: 'var(--text-primary)',
          fontWeight: 400,
          letterSpacing: '-0.5px'
        }}>
          ここから始まる AI モード
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          fontWeight: 400
        }}>
          質問が具体的なほど、回答の精度が上がります
        </p>
      </div>

      <div className="ai-welcome-input" style={{
        background: 'var(--bg-secondary)',
        borderRadius: '28px',
        padding: '20px 24px',
        marginBottom: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid var(--border-color)',
        width: '800px',
        maxWidth: '100%',
        position: 'relative'
      }}>
        {/* アップロードされたファイルのプレビュー */}
        {uploadedFiles.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {uploadedFiles.map((file, index) => (
              <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                {file.type.startsWith('image/') && (
                  <img src={uploadedPreviews[index]} alt={file.name} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                )}
                {file.type.startsWith('video/') && (
                  <video src={uploadedPreviews[index]} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                )}
                {file.type.startsWith('audio/') && (
                  <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--text-secondary)">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}
                  title="削除"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'rgba(0,0,0,0.6)', padding: '2px 4px', fontSize: '9px', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {file.name}
                </div>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && (searchQuery.trim() || uploadedFiles.length > 0)) {
              e.preventDefault()
              onNavigate(searchQuery || '添付ファイルについて教えて')
            }
          }}
          placeholder={uploadedFiles.length > 0 ? "ファイルについて質問..." : "質問する"}
          rows={3}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '16px',
            fontWeight: 400,
            fontFamily: 'inherit',
            resize: 'none',
            lineHeight: '1.5'
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="file"
              id="welcome-file-upload"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileUpload}
              title="画像・動画・音声をアップロード"
              style={{ display: 'none' }}
            />
            <label
              htmlFor="welcome-file-upload"
              title="画像・動画・音声をアップロード"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: uploadedFiles.length > 0 ? '#8ab4f8' : 'var(--text-secondary)',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onVoiceInput}
              title="音声入力"
              aria-label="音声入力"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isListening ? '#8ab4f8' : 'var(--text-secondary)',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                if (searchQuery.trim() || uploadedFiles.length > 0) {
                  onNavigate(searchQuery || '添付ファイルについて教えて')
                }
              }}
              disabled={!searchQuery.trim() && uploadedFiles.length === 0}
              title="送信"
              aria-label="送信"
              style={{
                background: (searchQuery.trim() || uploadedFiles.length > 0) ? '#8ab4f8' : 'var(--bg-tertiary)',
                border: 'none',
                cursor: (searchQuery.trim() || uploadedFiles.length > 0) ? 'pointer' : 'not-allowed',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: (searchQuery.trim() || uploadedFiles.length > 0) ? '#202124' : 'var(--text-tertiary)',
                borderRadius: '50%',
                transition: 'background-color 0.2s',
                width: '36px',
                height: '36px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 13h11.17l-4.88 4.88c-.39.39-.39 1.03 0 1.42.39.39 1.02.39 1.41 0l6.59-6.59c.39-.39.39-1.02 0-1.41l-6.58-6.6c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L16.17 11H5c-.55 0-1 .45-1 1s.45 1 1 1z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <button
          onClick={() => onNavigate('ヒカマーとは')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '16px 20px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            textAlign: 'left',
            borderRadius: '12px',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'var(--text-secondary)' }}>
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>ヒカマーとは</span>
        </button>
        <button
          onClick={() => onNavigate('昨日はなにがあった？')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '16px 20px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            textAlign: 'left',
            borderRadius: '12px',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'var(--text-secondary)' }}>
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>昨日はなにがあった？</span>
        </button>
        <button
          onClick={() => onNavigate('ここ一週間でバズったヒカマーのツイートは？')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '16px 20px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            textAlign: 'left',
            borderRadius: '12px',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'var(--text-secondary)' }}>
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>ここ一週間でバズったヒカマーのツイートは？</span>
        </button>
      </div>
    </div>
  )
}
