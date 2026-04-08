export interface Participant {
  id: string
  userId: string
  userName: string
  profileImageUrl: string
  allProfileImages?: string[]
  voiceURI?: string
}

export interface Message {
  participantId: string
  content: string
  thinking?: string
  timestamp: Date
}

export interface UserOption {
  userId: string
  userName: string
  profileImageUrl: string
  allProfileImages: string[]
  tweetCount: number
}
