'use client'

import { useRef } from 'react'
import styles from '../chat.module.css'

interface ChatInputProps {
  input: string
  setInput: (v: string) => void
  isLoading: boolean
  userId: string
  uploadedFiles: File[]
  uploadedPreviews: string[]
  onSubmit: (e: React.FormEvent) => void
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
}

export function ChatInput({
  input, setInput, isLoading, userId,
  uploadedFiles, uploadedPreviews,
  onSubmit, onFileUpload, onRemoveFile
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  return (
    <form onSubmit={onSubmit} className={styles.inputArea}>
      {uploadedFiles.length > 0 && (
        <div className={styles.uploadedFiles}>
          {uploadedFiles.map((file, i) => (
            <div key={i} className={styles.uploadedFile}>
              {uploadedPreviews[i] && file.type.startsWith('image/') ? (
                <img src={uploadedPreviews[i]} alt="" className={styles.uploadThumb} />
              ) : (
                <span className={styles.uploadIcon}>📎</span>
              )}
              <button type="button" onClick={() => onRemoveFile(i)} className={styles.removeFile}>×</button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.inputRow}>
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()} 
          className={styles.attachBtn}
          disabled={isLoading || uploadedFiles.length >= 5}
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={onFileUpload}
          style={{ display: 'none' }}
          title="画像・動画・音声をアップロード"
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`@${userId} に話しかける...`}
          disabled={isLoading}
          className={styles.input}
        />
        <button type="submit" disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)} className={styles.sendBtn}>
          {isLoading ? '...' : '送信'}
        </button>
      </div>
    </form>
  )
}
