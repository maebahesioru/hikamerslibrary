import { calculateSimilarity } from '@/app/utils/queryExpansion'
import { calculateNgramCosineSimilarity, calculateCompositeSimilarity } from '@/app/utils/vectorSimilarity'

const SYNONYM_GROUPS: string[][] = [
  ['面白い', 'おもしろい', '笑える', 'ウケる', '草', 'ワロタ', '爆笑', 'ワロス', '笑った', '吹いた'],
  ['可愛い', 'かわいい', 'カワイイ', 'きゃわ', 'キュート', 'cute', 'kawaii', '萌え', '尊い'],
  ['すごい', '凄い', 'やばい', 'ヤバい', '神', '最高', 'すげー', 'すげえ', 'えぐい', 'エグい', '半端ない'],
  ['好き', 'すき', '大好き', '推し', '推せる', 'love', '愛してる', '惚れた'],
  ['嫌い', 'きらい', '無理', 'むり', '苦手', 'キモい', 'きもい', 'ウザい'],
  ['楽しい', 'たのしい', '楽しみ', 'ワクワク', 'エモい', '最高', 'テンション上がる'],
  ['悲しい', 'かなしい', '泣ける', '涙', 'つらい', '辛い', '切ない', 'しんどい'],
  ['怒り', '怒る', 'キレる', 'ムカつく', 'イライラ', '腹立つ', 'ふざけんな'],
  ['動画', 'ビデオ', 'video', 'movie', '映像', 'ムービー', 'clip'],
  ['画像', '写真', 'pic', 'photo', 'image', '絵', 'イラスト', 'ファンアート'],
  ['配信', 'ライブ', 'live', '生放送', '枠', 'stream', '放送'],
  ['ゲーム', 'game', 'ゲー', 'プレイ', 'gaming', '実況'],
  ['歌', '曲', '音楽', 'music', 'song', '歌ってみた', 'カバー'],
  ['新しい', '新作', '最新', 'new', 'ニュー', '新発売'],
  ['買った', '購入', 'ゲット', '手に入れた', '入手'],
  ['見た', '観た', '視聴', '鑑賞', 'watched'],
  ['食べた', '食った', '食べ', '飯', 'ご飯', 'メシ', '美味しい', 'うまい'],
]

const SYNONYM_MAP: Map<string, Set<string>> = new Map()
for (const group of SYNONYM_GROUPS) {
  for (const word of group) {
    const existing = SYNONYM_MAP.get(word) || new Set()
    for (const synonym of group) {
      if (synonym !== word) existing.add(synonym)
    }
    SYNONYM_MAP.set(word, existing)
  }
}

const PARTIAL_PATTERNS: [RegExp, string[]][] = [
  [/面白|おもしろ|オモシロ/, ['面白い', '笑える', '草']],
  [/可愛|かわい|カワイ/, ['可愛い', 'かわいい', '萌え']],
  [/すご|凄|スゴ/, ['すごい', '神', 'やばい']],
  [/やば|ヤバ/, ['やばい', 'すごい', '神']],
  [/楽し|たのし/, ['楽しい', 'ワクワク', 'エモい']],
  [/悲し|かなし/, ['悲しい', '泣ける', '切ない']],
  [/怒|おこ|キレ/, ['怒り', 'ムカつく', 'イライラ']],
  [/嬉し|うれし/, ['嬉しい', '喜び', 'ハッピー']],
]

export function getSynonyms(keyword: string): string[] {
  const result = new Set<string>()
  const keyLower = keyword.toLowerCase()
  const exactMatch = SYNONYM_MAP.get(keyword) || SYNONYM_MAP.get(keyLower)
  if (exactMatch) exactMatch.forEach(s => result.add(s))
  for (const [pattern, synonyms] of PARTIAL_PATTERNS) {
    if (pattern.test(keyword)) synonyms.forEach(s => result.add(s))
  }
  return Array.from(result)
}

const POSITIVE_EMOJIS = /[😀😃😄😁😆😅🤣😂🙂😊😇🥰😍🤩😘😗😚😋😛😜🤪😝🤗🤭😏🥳🤠👍👏🎉✨💕❤️💖💗💓💞💘🔥⭐️🌟💯🙌]/g
const NEGATIVE_EMOJIS = /[😢😭😤😠😡🤬😈👿💀☠️💔😰😨😱😖😣😞😓😩😫🥺😿]/g
const KAOMOJI_POSITIVE = /[（(][^）)]*[笑嬉楽喜][^）)]*[）)]|[wｗ]{2,}|草+|ワロタ|爆笑/g
const KAOMOJI_NEGATIVE = /[（(][^）)]*[泣悲怒][^）)]*[）)]/g


function calculateBM25(term: string, text: string, totalDocs: number, docsWithTerm: number, avgDocLength: number, k1: number = 1.5, b: number = 0.75): number {
  const words = text.toLowerCase().split(/[\s　、。！？,.!?]+/)
  const termLower = term.toLowerCase()
  const termFreq = words.filter(w => w.includes(termLower)).length
  const docLength = words.length
  const idf = Math.log((totalDocs - docsWithTerm + 0.5) / (docsWithTerm + 0.5) + 1)
  const tfNorm = (termFreq * (k1 + 1)) / (termFreq + k1 * (1 - b + b * (docLength / avgDocLength)))
  return idf * tfNorm
}

export function calculateAdvancedScore(
  tweet: any, query: string, keywords: string[],
  totalDocs: number = 1000, termDocCounts: Map<string, number> = new Map(),
  queryEntities: { text: string; type: string }[] = [], avgDocLength: number = 100
): number {
  let score = 0
  const text = (tweet.displayText || '').toLowerCase()
  const name = (tweet.name || tweet.userName || '').toLowerCase()
  const oderId = (tweet.userId || '').toLowerCase()

  const matchedKeywords = keywords.filter(keyword => text.includes(keyword.toLowerCase()))
  if (keywords.length > 1 && matchedKeywords.length === keywords.length) score += 15000

  if (query.length > 0 && text.length > 0) {
    const compositeSim = calculateCompositeSimilarity(query, text, { cosine: 0.5, jaccard: 0.3, dice: 0.2 })
    score += compositeSim * 600
    const ngramSim = calculateNgramCosineSimilarity(query, text, 2)
    score += ngramSim * 300
  }

  keywords.forEach(keyword => {
    const bm25 = calculateBM25(keyword, text, totalDocs, termDocCounts.get(keyword) || 100, avgDocLength)
    score += bm25 * 400
  })

  for (const keyword of keywords) {
    if (keyword.length >= 3) {
      const textWords = text.split(/[\s　、。！？,.!?]+/).filter((w: string) => w.length >= 2)
      for (const word of textWords.slice(0, 50)) {
        const similarity = calculateSimilarity(keyword, word)
        if (similarity >= 0.7 && similarity < 1.0) score += similarity * 200
      }
    }
  }

  if (queryEntities.length > 0) {
    for (const entity of queryEntities) {
      const entityLower = entity.text.toLowerCase()
      if (text.includes(entityLower)) {
        switch (entity.type) {
          case 'person': score += 800; break
          case 'location': score += 500; break
          case 'organization': score += 600; break
          case 'hashtag': score += 400; break
          case 'mention': score += 700; break
          default: score += 300
        }
      }
      if (name.includes(entityLower) || oderId.includes(entityLower)) score += 500
    }
  }

  if (keywords.length >= 2) {
    const positions: number[] = []
    keywords.forEach(k => {
      const pos = text.indexOf(k.toLowerCase())
      if (pos !== -1) positions.push(pos)
    })
    if (positions.length >= 2) {
      positions.sort((a, b) => a - b)
      const maxDistance = positions[positions.length - 1] - positions[0]
      if (maxDistance < 50) score += 500
      else if (maxDistance < 100) score += 300
      else if (maxDistance < 200) score += 100
    }
  }

  for (const keyword of keywords) {
    const synonyms = getSynonyms(keyword)
    let synonymMatched = false
    for (const synonym of synonyms) {
      if (text.includes(synonym.toLowerCase())) { score += 150; synonymMatched = true }
    }
    if (synonymMatched && synonyms.filter(s => text.includes(s.toLowerCase())).length > 1) score += 100
  }

  const positiveEmojiCount = (text.match(POSITIVE_EMOJIS) || []).length
  const negativeEmojiCount = (text.match(NEGATIVE_EMOJIS) || []).length
  const positiveKaomojiCount = (text.match(KAOMOJI_POSITIVE) || []).length
  const negativeKaomojiCount = (text.match(KAOMOJI_NEGATIVE) || []).length
  const emotionScore = positiveEmojiCount + negativeEmojiCount + positiveKaomojiCount + negativeKaomojiCount
  if (emotionScore > 0) score += Math.min(emotionScore * 20, 100)

  return Math.round(score)
}

function calculateTextHash(text: string): number {
  let hash = 0
  const normalized = text.toLowerCase().replace(/[\s　、。！？,.!?@#]/g, '')
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i)
    hash = hash & hash
  }
  return hash
}

export function penalizeSimilarTweets(scoredTweets: { tweet: any; score: number }[]): { tweet: any; score: number }[] {
  const seenHashes = new Map<number, number>()
  const seenTexts = new Set<string>()
  return scoredTweets.map(item => {
    const text = (item.tweet.displayText || '').toLowerCase()
    const hash = calculateTextHash(text)
    if (seenTexts.has(text)) return { ...item, score: item.score - 5000 }
    seenTexts.add(text)
    const similarCount = seenHashes.get(hash) || 0
    if (similarCount > 0) return { ...item, score: item.score - (similarCount * 500) }
    seenHashes.set(hash, similarCount + 1)
    return item
  })
}

export function diversifyResults(tweets: any[]): any[] {
  const result: any[] = []
  const userLastIndex = new Map<string, number>()
  const minDistance = 8
  const pending: any[] = []
  for (const tweet of tweets) {
    const lastIndex = userLastIndex.get(tweet.userId)
    if (lastIndex === undefined || result.length - lastIndex >= minDistance) {
      result.push(tweet)
      userLastIndex.set(tweet.userId, result.length - 1)
    } else {
      pending.push(tweet)
    }
  }
  result.push(...pending)
  return result
}
