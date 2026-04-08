export interface ConversationEntry {
  query: string
  response: string
  thinking?: string
  tweets?: any[]
}

export interface MediaFile {
  data: string // Base64
  mimeType: string
}

export interface SearchQuery {
  keyword: string
  count: number
  from?: string
  to?: string
  since?: string
  until?: string
  minLikes?: number
  minRts?: number
  minReplies?: number
  minViews?: number
  minBookmarks?: number
  exclude?: string
  or?: string
  hasMedia?: string
  hasReply?: string
  hasQuote?: string
  hasHashtag?: string
  hasMention?: string
  verified?: string
  lang?: string
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface ContextStats {
  chars: number
  tweets: number
}

export type LoadingStep = 'keywords' | 'tweets' | 'thinking' | 'generating'

export interface LightTweet {
  id: string
  createdAt: string
  displayText: string
  replyCount: string | number
  rtCount: string | number
  qtCount: string | number
  likesCount: string | number
  inReplyToScreenName?: string
  quotedTweetText?: string
  userName: string
  name: string
  userId: string
}

export interface UseAiSearchProps {
  submittedQuery: string
  shareId: string
  executeRecaptcha: (action: string) => Promise<string | null>
  mediaFiles?: MediaFile[]
}
