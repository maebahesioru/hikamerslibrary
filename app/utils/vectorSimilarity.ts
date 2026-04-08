/**
 * ベクトル類似度（コサイン類似度）
 * テキストをベクトル化して意味的な類似度を計算
 * 
 * 特徴:
 * - 単語の出現パターンから類似度を計算
 * - 同義語や関連語を含む文書を見つけやすい
 * - TF-IDFやBM25と組み合わせて使用可能
 */

/**
 * テキストをトークン化（単語に分割）
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s　、。！？,.!?]+/)
    .filter(w => w.length > 0)
}

/**
 * テキストから単語頻度ベクトルを作成
 * 
 * @param text - テキスト
 * @returns 単語頻度マップ
 */
export function createFrequencyVector(text: string): Map<string, number> {
  const tokens = tokenize(text)
  const vector = new Map<string, number>()
  
  tokens.forEach(token => {
    vector.set(token, (vector.get(token) || 0) + 1)
  })
  
  return vector
}

/**
 * TF-IDF重み付きベクトルを作成
 * 
 * @param text - テキスト
 * @param idfMap - IDF値のマップ
 * @returns TF-IDF重み付きベクトル
 */
export function createTFIDFVector(
  text: string,
  idfMap: Map<string, number>
): Map<string, number> {
  const tokens = tokenize(text)
  const tf = new Map<string, number>()
  
  // TF（単語頻度）を計算
  tokens.forEach(token => {
    tf.set(token, (tf.get(token) || 0) + 1)
  })
  
  // TF-IDFベクトルを作成
  const tfidfVector = new Map<string, number>()
  tf.forEach((freq, token) => {
    const idf = idfMap.get(token) || 0
    tfidfVector.set(token, freq * idf)
  })
  
  return tfidfVector
}

/**
 * ベクトルの大きさ（ノルム）を計算
 * 
 * @param vector - ベクトル
 * @returns ノルム
 */
function calculateNorm(vector: Map<string, number>): number {
  let sumOfSquares = 0
  vector.forEach(value => {
    sumOfSquares += value * value
  })
  return Math.sqrt(sumOfSquares)
}

/**
 * 2つのベクトルの内積を計算
 * 
 * @param vector1 - ベクトル1
 * @param vector2 - ベクトル2
 * @returns 内積
 */
function calculateDotProduct(
  vector1: Map<string, number>,
  vector2: Map<string, number>
): number {
  let dotProduct = 0
  
  // 小さい方のベクトルでループ（効率化）
  const [smaller, larger] = vector1.size < vector2.size 
    ? [vector1, vector2] 
    : [vector2, vector1]
  
  smaller.forEach((value, key) => {
    const otherValue = larger.get(key)
    if (otherValue !== undefined) {
      dotProduct += value * otherValue
    }
  })
  
  return dotProduct
}

/**
 * コサイン類似度を計算
 * 2つのテキストの類似度を0-1の範囲で返す（1に近いほど類似）
 * 
 * @param text1 - テキスト1
 * @param text2 - テキスト2
 * @param useTFIDF - TF-IDF重み付けを使用するか（デフォルト: false）
 * @param idfMap - IDF値のマップ（useTFIDF=trueの場合に必要）
 * @returns コサイン類似度（0-1）
 */
export function calculateCosineSimilarity(
  text1: string,
  text2: string,
  useTFIDF: boolean = false,
  idfMap?: Map<string, number>
): number {
  // ベクトルを作成
  const vector1 = useTFIDF && idfMap
    ? createTFIDFVector(text1, idfMap)
    : createFrequencyVector(text1)
  
  const vector2 = useTFIDF && idfMap
    ? createTFIDFVector(text2, idfMap)
    : createFrequencyVector(text2)
  
  // ベクトルが空の場合
  if (vector1.size === 0 || vector2.size === 0) {
    return 0
  }
  
  // コサイン類似度 = 内積 / (ノルム1 * ノルム2)
  const dotProduct = calculateDotProduct(vector1, vector2)
  const norm1 = calculateNorm(vector1)
  const norm2 = calculateNorm(vector2)
  
  if (norm1 === 0 || norm2 === 0) {
    return 0
  }
  
  return dotProduct / (norm1 * norm2)
}

/**
 * クエリと複数のテキストの類似度を計算
 * 
 * @param query - 検索クエリ
 * @param texts - テキストの配列
 * @param useTFIDF - TF-IDF重み付けを使用するか
 * @returns 各テキストの類似度スコアの配列
 */
export function calculateSimilarityScores(
  query: string,
  texts: string[],
  useTFIDF: boolean = false
): number[] {
  // IDF値を計算（TF-IDF使用時）
  let idfMap: Map<string, number> | undefined
  
  if (useTFIDF) {
    const documentFrequency = new Map<string, number>()
    const N = texts.length
    
    // 各文書に出現する単語をカウント
    texts.forEach(text => {
      const tokens = new Set(tokenize(text))
      tokens.forEach(token => {
        documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1)
      })
    })
    
    // IDF値を計算
    idfMap = new Map<string, number>()
    documentFrequency.forEach((df, token) => {
      idfMap!.set(token, Math.log((N + 1) / (df + 1)))
    })
  }
  
  // 各テキストとクエリの類似度を計算
  return texts.map(text => 
    calculateCosineSimilarity(query, text, useTFIDF, idfMap)
  )
}

/**
 * ジャッカード係数を計算
 * 2つのテキストの単語集合の類似度を計算（0-1）
 * 
 * @param text1 - テキスト1
 * @param text2 - テキスト2
 * @returns ジャッカード係数（0-1）
 */
export function calculateJaccardSimilarity(text1: string, text2: string): number {
  const tokens1 = new Set(tokenize(text1))
  const tokens2 = new Set(tokenize(text2))
  
  if (tokens1.size === 0 && tokens2.size === 0) {
    return 1 // 両方空の場合は完全一致
  }
  
  // 積集合（共通要素）
  const intersection = new Set(
    Array.from(tokens1).filter(token => tokens2.has(token))
  )
  
  // 和集合
  const union = new Set([...tokens1, ...tokens2])
  
  return intersection.size / union.size
}

/**
 * ダイス係数を計算
 * ジャッカード係数の変種で、共通要素をより重視
 * 
 * @param text1 - テキスト1
 * @param text2 - テキスト2
 * @returns ダイス係数（0-1）
 */
export function calculateDiceCoefficient(text1: string, text2: string): number {
  const tokens1 = new Set(tokenize(text1))
  const tokens2 = new Set(tokenize(text2))
  
  if (tokens1.size === 0 && tokens2.size === 0) {
    return 1
  }
  
  // 積集合（共通要素）
  const intersection = new Set(
    Array.from(tokens1).filter(token => tokens2.has(token))
  )
  
  // ダイス係数 = 2 * |A ∩ B| / (|A| + |B|)
  return (2 * intersection.size) / (tokens1.size + tokens2.size)
}

/**
 * 複合類似度スコアを計算
 * 複数の類似度指標を組み合わせて総合スコアを算出
 * 
 * @param text1 - テキスト1
 * @param text2 - テキスト2
 * @param weights - 各指標の重み { cosine, jaccard, dice }
 * @returns 複合類似度スコア（0-1）
 */
export function calculateCompositeSimilarity(
  text1: string,
  text2: string,
  weights: { cosine?: number; jaccard?: number; dice?: number } = {}
): number {
  const {
    cosine = 0.5,
    jaccard = 0.3,
    dice = 0.2
  } = weights
  
  const cosineSim = calculateCosineSimilarity(text1, text2)
  const jaccardSim = calculateJaccardSimilarity(text1, text2)
  const diceSim = calculateDiceCoefficient(text1, text2)
  
  // 重み付き平均
  const totalWeight = cosine + jaccard + dice
  return (cosineSim * cosine + jaccardSim * jaccard + diceSim * dice) / totalWeight
}

/**
 * N-gramベースのコサイン類似度
 * 文字レベルのN-gramで類似度を計算（タイポに強い）
 * 
 * @param text1 - テキスト1
 * @param text2 - テキスト2
 * @param n - N-gramのサイズ（デフォルト: 2）
 * @returns コサイン類似度（0-1）
 */
export function calculateNgramCosineSimilarity(
  text1: string,
  text2: string,
  n: number = 2
): number {
  // N-gramを生成
  const generateNgrams = (text: string): Map<string, number> => {
    const ngrams = new Map<string, number>()
    const normalized = text.toLowerCase().replace(/\s+/g, '')
    
    for (let i = 0; i <= normalized.length - n; i++) {
      const ngram = normalized.substring(i, i + n)
      ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1)
    }
    
    return ngrams
  }
  
  const ngrams1 = generateNgrams(text1)
  const ngrams2 = generateNgrams(text2)
  
  if (ngrams1.size === 0 || ngrams2.size === 0) {
    return 0
  }
  
  // コサイン類似度を計算
  const dotProduct = calculateDotProduct(ngrams1, ngrams2)
  const norm1 = calculateNorm(ngrams1)
  const norm2 = calculateNorm(ngrams2)
  
  if (norm1 === 0 || norm2 === 0) {
    return 0
  }
  
  return dotProduct / (norm1 * norm2)
}
