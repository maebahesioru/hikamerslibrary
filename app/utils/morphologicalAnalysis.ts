/**
 * 形態素解析: 日本語テキストを単語に分解
 * kuromoji.jsを使用
 */

import kuromoji from 'kuromoji'
import path from 'path'

// Tokenizerのキャッシュ
let tokenizerInstance: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null
let tokenizerPromise: Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> | null = null

/**
 * 辞書パスを取得（サーバーサイド/クライアントサイド両対応）
 */
function getDicPath(): string {
  // サーバーサイド（Node.js）の場合
  if (typeof window === 'undefined') {
    return path.join(process.cwd(), 'public', 'dict')
  }
  // クライアントサイド（ブラウザ）の場合
  return '/dict'
}

/**
 * Tokenizerを初期化（遅延ロード）
 */
function getTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
  if (tokenizerInstance) {
    return Promise.resolve(tokenizerInstance)
  }

  if (tokenizerPromise) {
    return tokenizerPromise
  }

  const dicPath = getDicPath()
  console.log(`[Morphological Analysis] Loading dictionary from: ${dicPath}`)

  tokenizerPromise = new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath }).build((err, tokenizer) => {
      if (err) {
        console.error('[Morphological Analysis] Failed to load tokenizer:', err)
        reject(err)
        return
      }
      console.log('[Morphological Analysis] Tokenizer loaded successfully')
      tokenizerInstance = tokenizer
      resolve(tokenizer)
    })
  })

  return tokenizerPromise
}

/**
 * テキストを形態素解析して単語に分解
 * 
 * @param text - 解析するテキスト
 * @returns 単語の配列
 */
export async function tokenize(text: string): Promise<string[]> {
  try {
    const tokenizer = await getTokenizer()
    const tokens = tokenizer.tokenize(text)
    
    // 単語のみを抽出（助詞や記号を除外）
    const words = tokens
      .filter(token => {
        // 名詞、動詞、形容詞、副詞のみ抽出
        const pos = token.pos
        return pos === '名詞' || pos === '動詞' || pos === '形容詞' || pos === '副詞'
      })
      .map(token => token.surface_form)
      .filter(word => word.length > 0)
    
    return words
  } catch (error) {
    console.error('[Morphological Analysis] Tokenization failed:', error)
    // フォールバック: スペース区切りで分割
    return text.split(/[\s　]+/).filter(w => w.length > 0)
  }
}

/**
 * テキストを形態素解析して詳細情報を取得
 * 
 * @param text - 解析するテキスト
 * @returns トークンの配列（品詞情報付き）
 */
export async function analyzeDetailed(text: string): Promise<Array<{
  word: string
  pos: string
  baseForm: string
}>> {
  try {
    const tokenizer = await getTokenizer()
    const tokens = tokenizer.tokenize(text)
    
    return tokens.map(token => ({
      word: token.surface_form,
      pos: token.pos,
      baseForm: token.basic_form
    }))
  } catch (error) {
    console.error('[Morphological Analysis] Detailed analysis failed:', error)
    return []
  }
}

/**
 * クエリを形態素解析してキーワードを抽出
 * 
 * @param query - 検索クエリ
 * @returns キーワードの配列（重要度順）
 */
export async function extractKeywords(query: string): Promise<string[]> {
  try {
    const tokenizer = await getTokenizer()
    const tokens = tokenizer.tokenize(query)
    
    // 品詞ごとに重要度を設定
    const posWeights: Record<string, number> = {
      '名詞': 10,
      '動詞': 8,
      '形容詞': 7,
      '副詞': 5,
      '接頭詞': 3,
      '接尾詞': 2
    }
    
    // トークンをスコアリング
    const scoredTokens = tokens
      .map(token => ({
        word: token.surface_form,
        baseForm: token.basic_form,
        pos: token.pos,
        score: posWeights[token.pos] || 0
      }))
      .filter(item => item.score > 0 && item.word.length > 0)
      .sort((a, b) => b.score - a.score)
    
    // 重複を除去して返す
    const keywords = new Set<string>()
    scoredTokens.forEach(item => {
      keywords.add(item.word)
      // 基本形も追加（活用形対応）
      if (item.baseForm && item.baseForm !== item.word) {
        keywords.add(item.baseForm)
      }
    })
    
    return Array.from(keywords)
  } catch (error) {
    console.error('[Morphological Analysis] Keyword extraction failed:', error)
    // フォールバック: スペース区切りで分割
    return query.split(/[\s　]+/).filter(w => w.length > 0)
  }
}

/**
 * 同期版（キャッシュがある場合のみ動作）
 * 初回は空配列を返す
 */
export function tokenizeSync(text: string): string[] {
  if (!tokenizerInstance) {
    // 非同期で初期化を開始
    getTokenizer().catch(console.error)
    return []
  }

  try {
    const tokens = tokenizerInstance.tokenize(text)
    return tokens
      .filter(token => {
        const pos = token.pos
        return pos === '名詞' || pos === '動詞' || pos === '形容詞' || pos === '副詞'
      })
      .map(token => token.surface_form)
      .filter(word => word.length > 0)
  } catch (error) {
    console.error('[Morphological Analysis] Sync tokenization failed:', error)
    return []
  }
}
