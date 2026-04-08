---
inclusion: always
---

# Technology Stack

## Data Format

- **Format**: TSV (Tab-Separated Values) - 超高速パース対応
- **Character Encoding**: UTF-8 (supports Japanese and other Unicode characters)
- **Storage Structure**: Year-based folders (`public/2010/` ~ `public/2026/`)

## Data Schema

TSV files contain the following columns:

### Tweet Data
- `id`: Tweet ID
- `createdAt`: Timestamp (format: YYYY-MM-DD HH:MM:SS TZ)
- `displayText`: Tweet content
- `lang`: Language code
- `source`: Tweet source (client)
- `replyCount`: Number of replies
- `rtCount`: Retweet count
- `qtCount`: Quote tweet count
- `likesCount`: Number of likes
- `viewCount`: View count
- `bookmarkCount`: Bookmark count
- `mediaType`: Media type (photo/video/なし)
- `media`: Media URLs
- `urls`: URLs in tweet
- `hashtags`: Hashtags
- `mentions`: Mentioned users

### Reply/Quote Data
- `inReplyToUserId`: Reply target user ID
- `inReplyToScreenName`: Reply target screen name
- `inReplyToTweetId`: Reply target tweet ID
- `quotedTweetId`: Quoted tweet ID
- `quotedTweetText`: Quoted tweet text

### User Data
- `userId`: User screen name (@handle)
- `userName`: Display name
- `userRestId`: User numeric ID
- `userDescription`: User bio
- `userFollowersCount`: Follower count
- `userFollowingCount`: Following count
- `userTweetCount`: Total tweet count
- `userCreatedAt`: Account creation date
- `userProfileImageUrl`: Profile image URL
- `userProfileBannerUrl`: Banner image URL
- `userVerified`: Verification status
- `userLocation`: User location

## Database

### Turso (LibSQL)
- **Primary Storage**: All tweets stored in Turso database
- **FTS5**: Full-text search with BM25 ranking
- **Location**: AWS ap-northeast-1 (Tokyo)

## Performance Optimization

### Streaming API (`/api/tweets/stream`)
- Server-side filtering with FTS5 full-text search
- BM25 ranking for relevance scoring
- 1-hour cache for search results
- Hybrid scoring: SQL pre-sort + API-side advanced scoring

### Search Features
- Advanced keyword matching with FTS5
- Query expansion and synonym support
- Entity recognition (names, locations, organizations)
- Time-based filtering
- Media filtering (images, videos)
- Multiple sort options (relevance, date, popularity)

## Common Operations

### Data Inspection (Local TSV files)
```bash
# View TSV data (Windows)
type public\2025\2025-01-12.tsv

# Count lines in TSV
find /c /v "" public\2025\2025-01-12.tsv

# Search for specific content
findstr "search_term" public\2025\*.tsv
```

### Data Analysis Tools
- **Turso CLI**: Database queries and management
- **Python with pandas**: For TSV processing
- **Excel/LibreOffice**: Manual inspection of TSV files
