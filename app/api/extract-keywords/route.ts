import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/postgres'

const MAX_TWEETS = 25000

// ストップワード
const STOP_WORDS = new Set([
  // 助詞
  'は', 'が', 'を', 'に', 'で', 'と', 'の', 'や', 'から', 'まで', 'より', 'へ', 'も', 'か', 'ね', 'よ', 'わ',
  // 接続・指示
  'について', 'に関して', 'とは', 'って', 'など', 'こと', 'もの', 'ところ', 'ため', 'よう', 'ほう',
  // 動詞・助動詞
  'ある', 'いる', 'する', 'した', 'して', 'ます', 'です', 'だ', 'である', 'なる', 'なった', 'できる',
  'ない', 'なかった', 'れる', 'られる', 'せる', 'させる',
  // タスク指示語
  'クイズ', '出して', 'まとめて', '教えて', '探して', '知りたい', '調べて', '考えて', '作って', '書いて',
  'ください', 'ほしい', '欲しい', 'たい', 'てほしい', 'てください',
  // SNS関連
  'ツイート', '投稿', '検索',
  // 一般的すぎる語
  '界隈', '歴史', '情報', '内容', '詳細', '一覧', 'リスト', 'まとめ', '解説', '説明', '紹介', '比較', '分析'
])

// 除外パターン（末尾）
const STOP_SUFFIXES = ['の', 'を', 'に', 'で', 'と', 'は', 'が', 'も', 'へ', 'から', 'まで', 'より', 'って', 'など']

// 曖昧な質問パターン
const VAGUE_PATTERNS = [
  /^他に(は|も)?何(か|が)?(ある|あり|ない)?[？?]?$/,
  /^(それ|これ)以外(は|に|も)?[？?]?$/,
  /^もっと(教えて|見せて|ある)[？?]?$/,
  /^(続き|続けて|次)[？?]?$/,
  /^(まだ|他に)(ある|あり)[？?]?$/,
  /^(何か|なんか)(他に|ほかに)?(ある|あり)?[？?]?$/,
  /^(別の|違う)(やつ|もの|の)(は|も)?[？?]?$/,
  /^(あと|後)(は|に)?[？?]?$/,
  /^(それで|で)[？?]?$/,
  /^(ほか|他)(には?|にも)?[？?]?$/,
]

function isVagueQuery(query: string): boolean {
  const normalized = query.trim()
  return VAGUE_PATTERNS.some(pattern => pattern.test(normalized))
}

export async function POST(request: NextRequest) {
  try {
    const { query, previousKeywords } = await request.json()

    if (!query) {
      return NextResponse.json({ keywords: [], originalQuery: '', error: 'クエリが必要です' }, { status: 400 })
    }

    // 曖昧な質問の場合、前回のキーワードを再利用
    if (isVagueQuery(query) && previousKeywords && previousKeywords.length > 0) {
      console.log(`[Extract Keywords] Vague query detected: "${query}" -> reusing previous keywords: [${previousKeywords.join(', ')}]`)
      return NextResponse.json({ 
        keywords: previousKeywords.map((k: string) => ({ keyword: k, count: MAX_TWEETS })), 
        originalQuery: query,
        isVague: true
      })
    }

    // 日本語テキストからキーワードを抽出
    const words: string[] = []
    
    // 「」『』内を優先抽出
    const quoted = query.match(/[「『【]([^」』】]+)[」』】]/g)
    if (quoted) {
      quoted.forEach((q: string) => words.push(q.slice(1, -1)))
    }
    
    // 前処理：分割パターン
    let text = query
      .replace(/[「『【][^」』】]+[」』】]/g, ' ')  // 引用符内は除去（既に抽出済み）
      .replace(/[・、。！？!?,，.．]/g, ' ')  // 区切り文字をスペースに
      .replace(/(.+?)や(.+?)(?=について|の|を|は|$)/g, '$1 $2')
      .replace(/(.+?)と(.+?)(?=について|の|を|は|$)/g, '$1 $2')
    
    // カタカナ語（2文字以上）
    const katakana = text.match(/[ァ-ヶー]{2,}/g) || []
    words.push(...katakana)
    
    // 英数字（2文字以上）
    const alpha = text.match(/[a-zA-Z][a-zA-Z0-9]{0,}/gi) || []
    words.push(...alpha.filter((w: string) => w.length >= 2))
    
    // 漢字のみ（2文字以上、固有名詞っぽいもの）
    const kanjiOnly = text.match(/[一-龯]{2,}/g) || []
    words.push(...kanjiOnly)

    // クリーンアップ：末尾の助詞を除去
    const cleaned = words.map((w: string) => {
      let word = w
      for (const suffix of STOP_SUFFIXES) {
        if (word.endsWith(suffix) && word.length > suffix.length + 1) {
          word = word.slice(0, -suffix.length)
        }
      }
      return word
    })

    // ストップワード除去 & 重複除去
    const filtered = [...new Set(cleaned)]
      .filter((w: string) => w.length >= 2)
      .filter((w: string) => !STOP_WORDS.has(w))
      .filter((w: string) => !/^(について|に関して|とは|って|など|ための|ように)/.test(w))
      .filter((w: string) => !/[をにでとはがもへ]$/.test(w))  // 末尾が助詞のものを除外
    
    console.log(`[Extract Keywords] Parsed: "${query}" -> [${filtered.join(', ')}]`)

    if (filtered.length === 0) {
      return NextResponse.json({ 
        keywords: [{ keyword: query, count: MAX_TWEETS }], 
        originalQuery: query 
      })
    }

    // DBでヒット確認（並列実行）
    const pool = getPool()
    const hitChecks = await Promise.all(
      filtered.map(async (word) => {
        try {
          const result = await pool.query(
            `SELECT COUNT(*) as cnt FROM tweets WHERE display_text ILIKE $1 LIMIT 1`,
            [`%${word}%`]
          )
          return { keyword: word, hitCount: parseInt(result.rows[0]?.cnt || '0') }
        } catch {
          return { keyword: word, hitCount: 0 }
        }
      })
    )

    // ヒットするキーワードのみ使用（制限なし）
    const validKeywords = hitChecks
      .filter(k => k.hitCount > 0)
      .sort((a, b) => b.hitCount - a.hitCount)

    let keywords: { keyword: string; count: number }[]
    
    if (validKeywords.length > 0) {
      // 各キーワードにMAX_TWEETSを割り当て（重複は後で除去される）
      keywords = validKeywords.map(k => ({ keyword: k.keyword, count: MAX_TWEETS }))
    } else {
      // ヒットなし：抽出したキーワードをそのまま使用
      keywords = filtered.map(k => ({ keyword: k, count: MAX_TWEETS }))
    }

    console.log(`[Extract Keywords] Final: [${keywords.map(k => k.keyword).join(', ')}]`)
    
    return NextResponse.json({ keywords, originalQuery: query }, {
      headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' }
    })

  } catch (error: any) {
    console.error('[Extract Keywords] Error:', error)
    return NextResponse.json({ keywords: [], originalQuery: '' })
  }
}
