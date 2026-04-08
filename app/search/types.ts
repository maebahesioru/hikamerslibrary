export interface Tweet {
  id: string
  createdAt: string
  displayText: string
  lang?: string
  source?: string
  replyCount: string
  rtCount: string
  qtCount: string
  likesCount: string
  viewCount?: string
  bookmarkCount?: string
  mediaType: string
  media: string
  urls?: string
  hashtags?: string
  mentions?: string
  inReplyToUserId?: string
  inReplyToScreenName?: string
  inReplyToTweetId?: string
  quotedTweetId?: string
  quotedTweetText?: string
  userId: string
  userName?: string
  userRestId?: string
  userDescription?: string
  userFollowersCount?: string
  userFollowingCount?: string
  userTweetCount?: string
  userCreatedAt?: string
  userProfileImageUrl?: string
  userProfileBannerUrl?: string
  userVerified?: string
  userLocation?: string
  // 後方互換性エイリアス
  name: string
  profileImage: string
}

export interface SelectedImage {
  tweet: Tweet
  imageUrl: string
  index: number
}
