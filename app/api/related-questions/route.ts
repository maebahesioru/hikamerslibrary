import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/postgres'

interface RelatedQuestion {
  question: string
  answer?: string
  tweetId?: string
  tweetUserId?: string
  tweetUserName?: string
  tweetProfileImage?: string
}

// 無効なハッシュタグをフィルタリング
function isValidTag(tag: string): boolean {
  const invalidPatterns = [
    /^sm\d+/i, /^PR$/i, /\|/, /ニコニコ/, /^[a-z]{2,4}\d{5,}/i,
    /youtube/i, /^ad$/i, /sponsored/i,
  ]
  if (tag.length < 2 || tag.length > 20) return false
  if (/^\d+$/.test(tag)) return false
  for (const pattern of invalidPatterns) {
    if (pattern.test(tag)) return false
  }
  return true
}

// ツイート本文からキーワードを抽出して質問を生成
function extractKeywordsFromText(text: string, query: string): string[] {
  const keywords: string[] = []
  
  // 「」や『』で囲まれた固有名詞
  const quotedMatches = text.match(/[「『](.*?)[」』]/g)
  if (quotedMatches) {
    for (const match of quotedMatches) {
      const word = match.slice(1, -1).trim()
      if (word.length >= 2 && word.length <= 15 && !word.includes(query)) {
        keywords.push(word)
      }
    }
  }
  
  // カタカナ語（4文字以上）
  const katakanaMatches = text.match(/[ァ-ヶー]{4,12}/g)
  if (katakanaMatches) {
    for (const word of katakanaMatches) {
      if (!word.includes(query) && !keywords.includes(word)) {
        keywords.push(word)
      }
    }
  }
  
  // 英単語（大文字始まり、4文字以上）
  const englishMatches = text.match(/[A-Z][a-zA-Z]{3,15}/g)
  if (englishMatches) {
    for (const word of englishMatches) {
      const lower = word.toLowerCase()
      if (!lower.includes(query.toLowerCase()) && !keywords.includes(word)) {
        keywords.push(word)
      }
    }
  }
  
  return keywords.slice(0, 3)
}

// ツイートから多様な質問を生成
function generateQuestionsFromTweet(tweet: any, query: string): { question: string, type: string }[] {
  const questions: { question: string, type: string }[] = []
  const text = String(tweet.display_text || '')
  const userName = String(tweet.user_name || '')
  const userId = String(tweet.user_id || '')
  
  // 1. 日付・イベント系（〇〇はいつ？）
  const datePatterns = [
    /(\d{1,2}月\d{1,2}日)/,
    /(\d{4}年\d{1,2}月)/,
    /(来週|今週|先週|来月|今月)/,
  ]
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      // イベント名っぽいものを探す
      const eventMatch = text.match(/[「『](.*?)[」』]/) || text.match(/([ァ-ヶー]{3,10}(ライブ|イベント|配信|放送|公開|発売))/)
      if (eventMatch) {
        questions.push({ question: `${eventMatch[1]}はいつ？`, type: 'date' })
      }
    }
  }
  
  // 2. 場所系（〇〇はどこ？）
  const placePatterns = [
    /([ァ-ヶー]{2,8}(駅|空港|ホール|アリーナ|ドーム|スタジアム|会場))/,
    /(東京|大阪|名古屋|福岡|札幌|横浜|神戸|京都|渋谷|新宿|池袋|秋葉原)/,
  ]
  for (const pattern of placePatterns) {
    const match = text.match(pattern)
    if (match && !match[1].includes(query)) {
      questions.push({ question: `${match[1]}はどこ？`, type: 'place' })
      break
    }
  }
  
  // 3. 数字・金額系（〇〇はいくら？〇〇は何人？）
  if (/\d+円|\d+万円|\d+億/.test(text)) {
    const productMatch = text.match(/[「『](.*?)[」』]/) || text.match(/([ァ-ヶー]{3,10})/)
    if (productMatch && !productMatch[1].includes(query)) {
      questions.push({ question: `${productMatch[1]}はいくら？`, type: 'price' })
    }
  }
  
  if (/\d+万人|\d+人|フォロワー/.test(text)) {
    questions.push({ question: `${userName}のフォロワー数は？`, type: 'followers' })
  }
  
  // 4. 理由系（なぜ〇〇？）
  if (/(話題|バズ|炎上|トレンド|人気)/.test(text)) {
    const topicMatch = text.match(/[「『](.*?)[」』]/) || text.match(/#([^\s#]+)/)
    if (topicMatch) {
      const topic = topicMatch[1]
      if (!topic.includes(query)) {
        questions.push({ question: `なぜ${topic}が話題？`, type: 'reason' })
      }
    }
  }
  
  // 5. コラボ・関係系（〇〇と〇〇の関係は？）
  const collabMatch = text.match(/([ァ-ヶーA-Za-z]{2,10})\s*[×xX&＆]\s*([ァ-ヶーA-Za-z]{2,10})/)
  if (collabMatch) {
    questions.push({ question: `${collabMatch[1]}と${collabMatch[2]}のコラボとは？`, type: 'collab' })
  }
  
  // 6. 新作・新曲系
  if (/(新曲|新作|新商品|新発売|リリース|デビュー)/.test(text)) {
    questions.push({ question: `${userName}の新曲・新作は？`, type: 'new' })
  }
  
  // 7. 感想・レビュー系
  if (/(見た|観た|聴いた|買った|食べた|行った|やった)/.test(text)) {
    const targetMatch = text.match(/[「『](.*?)[」』]/)
    if (targetMatch && !targetMatch[1].includes(query)) {
      questions.push({ question: `${targetMatch[1]}の感想は？`, type: 'review' })
    }
  }
  
  // 8. 比較系
  if (/(より|比べ|違い|どっち)/.test(text)) {
    const items = text.match(/([ァ-ヶーA-Za-z]{2,8})と([ァ-ヶーA-Za-z]{2,8})/)
    if (items) {
      questions.push({ question: `${items[1]}と${items[2]}の違いは？`, type: 'compare' })
    }
  }
  
  // 9. ユーザーについて（デフォルト）
  if (questions.length === 0 && userName) {
    questions.push({ question: `${userName}って誰？`, type: 'user' })
  }
  
  return questions
}

// 関連する質問をツイートデータから生成
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const random = searchParams.get('random')
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!query) {
    return NextResponse.json({ questions: [] })
  }

  try {
    const pool = getPool()
    const questions: RelatedQuestion[] = []
    const usedItems = new Set<string>()

    // ランダムモード
    if (random) {
      // ランダムなツイートから多様な質問を生成
      const result = await pool.query(
        `
          SELECT id, display_text, user_id, user_name, user_profile_image_url, hashtags
          FROM tweets
          WHERE LENGTH(display_text) > 30
          ORDER BY RANDOM()
          LIMIT 100
          OFFSET $1
        `,
        [offset]
      )

      const usedTypes = new Set<string>()
      
      for (const row of result.rows) {
        if (questions.length >= 4) break
        
        const generatedQuestions = generateQuestionsFromTweet(row, query)
        
        for (const q of generatedQuestions) {
          if (questions.length >= 4) break
          // 同じタイプの質問は避ける（多様性のため）
          if (usedTypes.has(q.type) && usedTypes.size < 5) continue
          if (usedItems.has(q.question.toLowerCase())) continue
          
          usedTypes.add(q.type)
          usedItems.add(q.question.toLowerCase())
          
          const displayText = String(row.display_text).replace(/\\n/g, '\n')
          questions.push({
            question: q.question,
            answer: displayText.length > 150 ? displayText.substring(0, 150) + '...' : displayText,
            tweetId: String(row.id),
            tweetUserId: String(row.user_id),
            tweetUserName: String(row.user_name),
            tweetProfileImage: row.user_profile_image_url || ''
          })
          break
        }
      }

      return NextResponse.json({ questions }, {
        headers: { 'Cache-Control': 'no-store' }
      })
    }

    // 通常モード: 複数ソースから質問を生成
    const result = await pool.query(
      `
        SELECT id, display_text, user_id, user_name, user_profile_image_url, 
               hashtags, mentions, user_followers_count
        FROM tweets
        WHERE display_text ILIKE $1
        ORDER BY likes_count DESC
        LIMIT 100
      `,
      [`%${query}%`]
    )

    // 1. よく出てくるユーザーから質問を生成
    const userCounts: Map<string, { count: number, tweet: any }> = new Map()
    for (const row of result.rows) {
      const key = String(row.user_id).toLowerCase()
      if (!userCounts.has(key)) {
        userCounts.set(key, { count: 1, tweet: row })
      } else {
        userCounts.get(key)!.count++
      }
    }

    const topUsers = Array.from(userCounts.entries())
      .filter(([_, data]) => data.count >= 2) // 2回以上出てくるユーザー
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 2)

    for (const [userId, data] of topUsers) {
      if (questions.length >= 4) break
      if (usedItems.has(userId)) continue
      usedItems.add(userId)
      
      const displayText = String(data.tweet.display_text).replace(/\\n/g, '\n')
      questions.push({
        question: `${data.tweet.user_name}って誰？`,
        answer: displayText.length > 150 ? displayText.substring(0, 150) + '...' : displayText,
        tweetId: String(data.tweet.id),
        tweetUserId: String(data.tweet.user_id),
        tweetUserName: String(data.tweet.user_name),
        tweetProfileImage: data.tweet.user_profile_image_url || ''
      })
    }

    // 2. よく出てくるメンションから質問を生成
    const mentionCounts: Map<string, number> = new Map()
    for (const row of result.rows) {
      if (!row.mentions) continue
      const mentions = String(row.mentions).split(',').map(m => m.trim()).filter(m => m.length > 1)
      for (const mention of mentions) {
        const key = mention.toLowerCase()
        if (key !== query.toLowerCase()) {
          mentionCounts.set(mention, (mentionCounts.get(mention) || 0) + 1)
        }
      }
    }

    const topMentions = Array.from(mentionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)

    for (const [mention, _] of topMentions) {
      if (questions.length >= 4) break
      if (usedItems.has(mention.toLowerCase())) continue
      usedItems.add(mention.toLowerCase())

      // このユーザーのツイートを取得
      const mentionTweet = await pool.query(
        `SELECT id, display_text, user_id, user_name, user_profile_image_url
         FROM tweets WHERE user_id = $1 ORDER BY likes_count DESC LIMIT 1`,
        [mention]
      )

      if (mentionTweet.rows.length > 0) {
        const row = mentionTweet.rows[0]
        const displayText = String(row.display_text).replace(/\\n/g, '\n')
        questions.push({
          question: `${row.user_name}って誰？`,
          answer: displayText.length > 150 ? displayText.substring(0, 150) + '...' : displayText,
          tweetId: String(row.id),
          tweetUserId: String(row.user_id),
          tweetUserName: String(row.user_name),
          tweetProfileImage: row.user_profile_image_url || ''
        })
      }
    }

    // 3. ハッシュタグから質問を生成（残り枠）
    const tagCounts: Map<string, { count: number, tweet: any }> = new Map()
    for (const row of result.rows) {
      if (!row.hashtags) continue
      const tags = String(row.hashtags).split(',').map(t => t.trim()).filter(t => isValidTag(t))
      for (const tag of tags) {
        const key = tag.toLowerCase()
        if (key === query.toLowerCase() || key.includes(query.toLowerCase())) continue
        if (!tagCounts.has(tag)) {
          tagCounts.set(tag, { count: 1, tweet: row })
        } else {
          tagCounts.get(tag)!.count++
        }
      }
    }

    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 4 - questions.length)

    for (const [tag, data] of topTags) {
      if (questions.length >= 4) break
      if (usedItems.has(tag.toLowerCase())) continue
      usedItems.add(tag.toLowerCase())

      const displayText = String(data.tweet.display_text).replace(/\\n/g, '\n')
      questions.push({
        question: `${tag}とは？`,
        answer: displayText.length > 150 ? displayText.substring(0, 150) + '...' : displayText,
        tweetId: String(data.tweet.id),
        tweetUserId: String(data.tweet.user_id),
        tweetUserName: String(data.tweet.user_name),
        tweetProfileImage: data.tweet.user_profile_image_url || ''
      })
    }

    // 4. ツイート本文から多様な質問を生成（残り枠）
    if (questions.length < 4) {
      const usedTypes = new Set<string>()
      
      for (const row of result.rows) {
        if (questions.length >= 4) break
        
        const generatedQuestions = generateQuestionsFromTweet(row, query)
        
        for (const q of generatedQuestions) {
          if (questions.length >= 4) break
          if (q.type === 'user') continue // ユーザー系は既に上で処理済み
          if (usedTypes.has(q.type)) continue
          if (usedItems.has(q.question.toLowerCase())) continue
          
          usedTypes.add(q.type)
          usedItems.add(q.question.toLowerCase())
          
          const displayText = String(row.display_text).replace(/\\n/g, '\n')
          questions.push({
            question: q.question,
            answer: displayText.length > 150 ? displayText.substring(0, 150) + '...' : displayText,
            tweetId: String(row.id),
            tweetUserId: String(row.user_id),
            tweetUserName: String(row.user_name),
            tweetProfileImage: row.user_profile_image_url || ''
          })
        }
      }
    }

    return NextResponse.json({ questions }, {
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600' }
    })
  } catch (error) {
    console.error('Related questions error:', error)
    return NextResponse.json({ questions: [] })
  }
}
