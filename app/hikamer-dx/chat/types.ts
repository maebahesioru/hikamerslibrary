export interface Message {
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  mediaFiles?: { data: string; mimeType: string; preview?: string }[]
  relatedQuestions?: string[]
}

export interface UserOption {
  userId: string
  userName: string
  profileImageUrl: string
  allProfileImages: string[]
  tweetCount: number
}

export interface UserInfo {
  userName: string
  profileImageUrl: string
  allProfileImages: string[]
  description: string
}
