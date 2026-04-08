'use client'

import { Suspense } from 'react'
import styles from './group.module.css'
import { useGroupChat } from './hooks/useGroupChat'
import { SetupScreen } from './components/SetupScreen'
import { ChatScreen } from './components/ChatScreen'

function GroupChatContent() {
  const chat = useGroupChat()

  if (chat.isSetup) {
    return (
      <SetupScreen
        participants={chat.participants}
        userList={chat.userList}
        userSearch={chat.userSearch}
        setUserSearch={chat.setUserSearch}
        loadingUsers={chat.loadingUsers}
        customPrompt={chat.customPrompt}
        setCustomPrompt={chat.setCustomPrompt}
        autoSpeak={chat.autoSpeak}
        setAutoSpeak={chat.setAutoSpeak}
        voices={chat.voices}
        addParticipant={chat.addParticipant}
        removeParticipant={chat.removeParticipant}
        updateParticipantVoice={chat.updateParticipantVoice}
        startChat={chat.startChat}
      />
    )
  }

  return (
    <ChatScreen
      participants={chat.participants}
      messages={chat.messages}
      input={chat.input}
      setInput={chat.setInput}
      isLoading={chat.isLoading}
      currentSpeaker={chat.currentSpeaker}
      autoPlay={chat.autoPlay}
      setAutoPlay={chat.setAutoPlay}
      autoPlayInterval={chat.autoPlayInterval}
      setAutoPlayInterval={chat.setAutoPlayInterval}
      autoSpeak={chat.autoSpeak}
      setAutoSpeak={chat.setAutoSpeak}
      isSpeaking={chat.isSpeaking}
      speak={chat.speak}
      stop={chat.stop}
      messagesEndRef={chat.messagesEndRef}
      setIsSetup={chat.setIsSetup}
      makeAiSpeak={chat.makeAiSpeak}
      triggerAutoPlay={chat.triggerAutoPlay}
      sendHumanMessage={chat.sendHumanMessage}
    />
  )
}

export default function GroupChatPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>読み込み中...</div>}>
      <GroupChatContent />
    </Suspense>
  )
}
