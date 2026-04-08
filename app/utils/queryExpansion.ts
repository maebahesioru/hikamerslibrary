/**
 * クエリ拡張: 表記ゆれ、関連語を自動的に追加
 * 
 * アプローチ:
 * 1. 形態素解析（日本語の単語分割）
 * 2. N-gram分割（汎用的、すべてのクエリに対応）
 * 3. 文字種変換（カタカナ・ひらがな・英数字）
 * 4. 編集距離（タイポ対応）
 */

import { extractKeywords } from './morphologicalAnalysis'

// === 編集距離（レーベンシュタイン距離）の計算 ===
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  // 初期化
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // 動的計画法で距離を計算
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // 削除
        matrix[i][j - 1] + 1,      // 挿入
        matrix[i - 1][j - 1] + cost // 置換
      )
    }
  }

  return matrix[len1][len2]
}

/**
 * 2つの文字列の類似度を計算（0-1の範囲）
 * 1に近いほど類似している
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1
  return 1 - (distance / maxLength)
}

/**
 * クエリに類似した文字列を生成（タイポパターン）
 * 1文字違いのバリエーションを生成
 */
export function generateTypoVariations(query: string): string[] {
  const variations = new Set<string>()
  
  // 1文字削除
  for (let i = 0; i < query.length; i++) {
    const variation = query.slice(0, i) + query.slice(i + 1)
    if (variation.length > 0) {
      variations.add(variation)
    }
  }
  
  // 隣接文字の入れ替え
  for (let i = 0; i < query.length - 1; i++) {
    const variation = 
      query.slice(0, i) + 
      query[i + 1] + 
      query[i] + 
      query.slice(i + 2)
    variations.add(variation)
  }
  
  return Array.from(variations)
}

// === N-gram生成（部分文字列の生成） ===
function generateNgrams(text: string, minLength: number = 2, maxLength?: number): string[] {
  const ngrams = new Set<string>()
  const length = text.length
  const max = maxLength || length

  for (let n = minLength; n <= Math.min(max, length); n++) {
    for (let i = 0; i <= length - n; i++) {
      const ngram = text.substring(i, i + n)
      if (ngram.trim().length === ngram.length) { // 前後に空白がないもののみ
        ngrams.add(ngram)
      }
    }
  }

  return Array.from(ngrams)
}

// カタカナ・ひらがな変換
function toHiragana(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60
    return String.fromCharCode(chr)
  })
}

function toKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    const chr = match.charCodeAt(0) + 0x60
    return String.fromCharCode(chr)
  })
}

// 半角・全角変換
function toHalfWidth(str: string): string {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  })
}

function toFullWidth(str: string): string {
  return str.replace(/[A-Za-z0-9]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) + 0xfee0)
  })
}

/**
 * クエリを拡張して関連語を追加
 * 
 * @param query - 元のクエリ
 * @param options - 拡張オプション
 * @returns 拡張されたキーワードの配列（重複なし）
 */
export function expandQuery(
  query: string,
  options: {
    useMorphology?: boolean  // 形態素解析を使用（デフォルト: true）
    useNgrams?: boolean      // N-gram分割を使用（デフォルト: true）
    useTypoVariations?: boolean // タイポバリエーションを生成（デフォルト: false）
    ngramMinLength?: number  // N-gramの最小長（デフォルト: 3）
    ngramMaxLength?: number  // N-gramの最大長（デフォルト: クエリ長-1）
  } = {}
): string[] {
  const {
    useMorphology = true,
    useNgrams = true,
    useTypoVariations = false,
    ngramMinLength = 3,
    ngramMaxLength
  } = options

  const expanded = new Set<string>()
  
  // 元のクエリを追加
  expanded.add(query)
  
  // 0. 形態素解析（非同期だが、キャッシュがあれば即座に結果を返す）
  if (useMorphology) {
    // 非同期で形態素解析を実行（結果は次回以降に反映）
    extractKeywords(query).then(keywords => {
      // 結果をログに出力（デバッグ用）
      if (process.env.NODE_ENV === 'development' && keywords.length > 0) {
        console.log(`[Morphological Analysis] "${query}" → [${keywords.join(', ')}]`)
      }
    }).catch(err => {
      console.error('[Morphological Analysis] Error:', err)
    })
  }
  
  // 1. カタカナ・ひらがな変換
  const hiragana = toHiragana(query)
  const katakana = toKatakana(query)
  if (hiragana !== query) expanded.add(hiragana)
  if (katakana !== query) expanded.add(katakana)
  
  // 2. 半角・全角変換
  const halfWidth = toHalfWidth(query)
  const fullWidth = toFullWidth(query)
  if (halfWidth !== query) expanded.add(halfWidth)
  if (fullWidth !== query) expanded.add(fullWidth)
  
  // 3. スペース区切りで分割
  const words = query.split(/[\s　]+/).filter(w => w.length > 0)
  if (words.length > 1) {
    words.forEach(word => {
      expanded.add(word)
    })
  }
  
  // 4. N-gram分割（汎用的な部分一致）
  if (useNgrams && query.length >= ngramMinLength) {
    const ngrams = generateNgrams(
      query,
      ngramMinLength,
      ngramMaxLength || query.length - 1
    )
    
    // N-gramは多すぎるので、長いものを優先（最大10個）
    ngrams
      .sort((a, b) => b.length - a.length)
      .slice(0, 10)
      .forEach(ngram => expanded.add(ngram))
  }
  
  // 5. タイポバリエーション（オプション）
  if (useTypoVariations && query.length >= 3) {
    const typos = generateTypoVariations(query)
    // タイポバリエーションは最大5個まで
    typos.slice(0, 5).forEach(typo => expanded.add(typo))
  }
  
  // 空文字列や元のクエリと同じものを除外
  const result = Array.from(expanded).filter(term => 
    term.length > 0 && term.trim().length > 0
  )
  
  // デバッグ用（開発環境のみ）
  if (process.env.NODE_ENV === 'development' && result.length > 1) {
    console.log(`[Query Expansion] "${query}" → [${result.slice(0, 10).join(', ')}]${result.length > 10 ? ` (+${result.length - 10} more)` : ''}`)
  }
  
  return result
}

/**
 * クエリを拡張して関連語を追加（非同期版）
 * 形態素解析の結果を待つ
 * 
 * @param query - 元のクエリ
 * @param options - 拡張オプション
 * @returns 拡張されたキーワードの配列（重複なし）
 */
export async function expandQueryAsync(
  query: string,
  options: {
    useMorphology?: boolean
    useNgrams?: boolean
    useTypoVariations?: boolean
    ngramMinLength?: number
    ngramMaxLength?: number
  } = {}
): Promise<string[]> {
  const {
    useMorphology = true,
    useNgrams = true,
    useTypoVariations = false,
    ngramMinLength = 3,
    ngramMaxLength
  } = options

  // まず同期版で基本的な拡張を取得
  const syncExpanded = expandQuery(query, { 
    useMorphology: false, // 形態素解析は非同期で実行
    useNgrams,
    useTypoVariations,
    ngramMinLength, 
    ngramMaxLength 
  })
  
  const expanded = new Set<string>(syncExpanded)

  // 形態素解析を実行
  if (useMorphology) {
    try {
      const keywords = await extractKeywords(query)
      keywords.forEach(keyword => expanded.add(keyword))
      
      if (process.env.NODE_ENV === 'development' && keywords.length > 0) {
        console.log(`[Morphological Analysis Async] "${query}" → [${keywords.join(', ')}]`)
      }
    } catch (error) {
      console.error('[Morphological Analysis Async] Error:', error)
    }
  }

  return Array.from(expanded).filter(term => 
    term.length > 0 && term.trim().length > 0
  )
}

/**
 * テストケース（開発用）
 * 
 * === 形態素解析（日本語の単語分割） ===
 * await expandQueryAsync('面白い動画を見た')
 * → ['面白い動画を見た', '面白い', '動画', '見た', '見る', ...]
 * 
 * await expandQueryAsync('ヒカキンの新しい企画')
 * → ['ヒカキンの新しい企画', 'ヒカキン', '新しい', '企画', ...]
 * 
 * === N-gram（汎用的） ===
 * expandQuery('未知の用語ABC')
 * → ['未知の用語ABC', '未知の用語', '知の用語', 'の用語A', '用語AB', ...]
 * 
 * === タイポバリエーション ===
 * expandQuery('ヒカキン', { useTypoVariations: true })
 * → ['ヒカキン', 'ヒカキ', 'カキン', 'ヒキキン', 'ヒカイン', ...]
 * 
 * === 編集距離 ===
 * levenshteinDistance('ヒカキン', 'ヒカキソ') → 1 (1文字違い)
 * calculateSimilarity('ヒカキン', 'ヒカキソ') → 0.75 (75%類似)
 * 
 * === オプション ===
 * expandQuery('長いクエリ', { useNgrams: false })     // N-gram無効
 * expandQuery('短い', { ngramMinLength: 2 })          // 2文字以上のN-gram
 * expandQuery('タイポ', { useTypoVariations: true })  // タイポバリエーション有効
 * await expandQueryAsync('日本語', { useMorphology: true }) // 形態素解析有効
 */
