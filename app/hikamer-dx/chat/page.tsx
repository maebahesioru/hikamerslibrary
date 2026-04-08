'use client'

import { useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './chat.module.css'
import { useTTS } from '../../hooks/useTTS'
import { useChat, useUserList } from './hooks/useChat'
import { UserSelect } from './components/UserSelect'
import { ChatHeader } from './components/ChatHeader'
import { ChatMessages } from './components/ChatMessages'
import { ChatInput } from './components/ChatInput'
import { WelcomeScreen } from './components/WelcomeScreen'

function ChatContent() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('user') || ''
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [userSearch, setUserSearch] = useState('')
  const { userList, loadingUsers } = useUserList(userId, userSearch)
  
  const {
    messages, input, setInput, isLoading, userInfo,
    uploadedFiles, uploadedPreviews, randomSuggestions,
    handleFileUpload, removeFile, sendMessage
  } = useChat(userId)
  
  const { isSpeaking, speak, stop, voices, selectedVoice, setSelectedVoice } = useTTS()

  if (!userId) {
    return (
      <UserSelect
        userSearch={userSearch}
        setUserSearch={setUserSearch}
        userList={userList}
        loadingUsers={loadingUsers}
      />
    )
  }
  
  return (
    <div className={styles.container}>
      <ChatHeader
        userId={userId}
        userInfo={userInfo}
        voices={voices}
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
      />
      
      <div className={styles.chatArea}>
        {messages.length === 0 && userInfo && (
          <WelcomeScreen
            userId={userId}
            userInfo={userInfo}
            suggestions={randomSuggestions}
            setInput={setInput}
          />
        )}
        
        <ChatMessages
          messages={messages}
          userInfo={userInfo}
          isLoading={isLoading}
          isSpeaking={isSpeaking}
          speak={speak}
          stop={stop}
          setInput={setInput}
        />
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        userId={userId}
        uploadedFiles={uploadedFiles}
        uploadedPreviews={uploadedPreviews}
        onSubmit={sendMessage}
        onFileUpload={handleFileUpload}
        onRemoveFile={removeFile}
      />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>}>
      <ChatContent />
    </Suspense>
  )
}
