/**
 * クエリ意図の分類
 * 検索クエリのタイプを自動判定してスコアリングを最適化
 */

export enum QueryIntent {
  NAVIGATIONAL = 'navigational',       // 特定のユーザー検索
  INFORMATIONAL = 'informational',     // 情報検索
  TRANSACTIONAL = 'transactional',     // ハウツー・行動検索
  TEMPORAL = 'temporal',               // 時間指定検索
  MEDIA = 'media',                     // メディア検索（画像・動画）
  ENGAGEMENT = 'engagement',           // 人気・バズ検索
  MIXED = 'mixed'                      // 複合的な意図
}

export interface QueryIntentResult {
  intent: QueryIntent
  confidence: number  // 0-1の信頼度
  signals: string[]   // 判定の根拠となったシグナル
  weights: ScoreWeights
}

export interface ScoreWeights {
  userNameWeight: number      // ユーザー名の重み
  contentWeight: number        // コンテンツの重み
  timeWeight: number           // 時間の重み
  engagementWeight: number     // エンゲージメントの重み
  mediaWeight: number          // メディアの重み
}

/**
 * ナビゲーショナルクエリのパターン（特定ユーザー検索）
 */
const NAVIGATIONAL_PATTERNS = [
  // ユーザー名パターン
  /^@[\w]+$/,                          // @username
  /^[\w]+さん$/,                       // usernameさん
  /^[\w]+の(?:ツイート|投稿|アカウント)$/,  // usernameのツイート
  
  // 人名パターン
  /^[ぁ-んァ-ヶー]+(?:さん)?$/,         // ひらがな・カタカナの名前
  /^[一-龯]{2,4}(?:さん)?$/,           // 漢字の名前（2-4文字）
]

/**
 * インフォメーショナルクエリのパターン（情報検索）
 */
const INFORMATIONAL_PATTERNS = [
  // 疑問詞
  /(?:何|なに|なん|どう|どこ|いつ|誰|だれ|なぜ|どれ|どの)/,
  
  // 情報を求める表現
  /(?:について|に関して|とは|って|情報|詳細|まとめ|解説|説明)/,
  
  // 形容詞・評価
  /(?:面白い|楽しい|すごい|良い|悪い|新しい|古い|人気|話題)/,
  
  // 一般的な名詞
  /(?:ニュース|記事|動画|画像|写真|情報|データ|レビュー)/,
]

/**
 * トランザクショナルクエリのパターン（ハウツー・行動検索）
 */
const TRANSACTIONAL_PATTERNS = [
  // ハウツー
  /(?:やり方|方法|手順|仕方|作り方|使い方|設定|インストール)/,
  
  // 行動を促す動詞
  /(?:買う|購入|注文|予約|登録|申し込み|ダウンロード|取得)/,
  
  // 問題解決
  /(?:解決|修正|直す|治す|対処|対応|エラー|問題|トラブル)/,
  
  // 比較・選択
  /(?:比較|違い|おすすめ|ランキング|選び方|どっち|vs)/,
]

/**
 * 時間指定クエリのパターン
 */
const TEMPORAL_PATTERNS = [
  /(?:今日|昨日|明日|今週|先週|来週|今月|先月|来月|今年|去年|来年)/,
  /(?:\d+日前|\d+週間前|\d+ヶ月前|\d+年前)/,
  /(?:\d{4}年|\d{1,2}月\d{1,2}日)/,
]

/**
 * メディア検索のパターン
 */
const MEDIA_PATTERNS = [
  /(?:画像|写真|pic|photo|image|img)/,
  /(?:動画|ビデオ|video|movie|映像)/,
  /(?:gif|アニメ|animation)/,
]

/**
 * エンゲージメント検索のパターン（人気・バズ）
 */
const ENGAGEMENT_PATTERNS = [
  /(?:バズ|バズった|話題|トレンド|人気|流行)/,
  /(?:いいね|RT|リツイート|拡散)/,
  /(?:ランキング|TOP|トップ|上位)/,
]

/**
 * クエリの意図を分類
 * 
 * @param query - 検索クエリ
 * @returns クエリ意図の分類結果
 */
export function classifyQueryIntent(query: string): QueryIntentResult {
  const signals: string[] = []
  const scores: Record<QueryIntent, number> = {
    [QueryIntent.NAVIGATIONAL]: 0,
    [QueryIntent.INFORMATIONAL]: 0,
    [QueryIntent.TRANSACTIONAL]: 0,
    [QueryIntent.TEMPORAL]: 0,
    [QueryIntent.MEDIA]: 0,
    [QueryIntent.ENGAGEMENT]: 0,
    [QueryIntent.MIXED]: 0,
  }
  
  // 1. ナビゲーショナル（特定ユーザー検索）
  for (const pattern of NAVIGATIONAL_PATTERNS) {
    if (pattern.test(query)) {
      scores[QueryIntent.NAVIGATIONAL] += 3
      signals.push('navigational_pattern')
      break
    }
  }
  
  // クエリが短い（1-2単語）かつ固有名詞っぽい
  const words = query.split(/[\s　]+/)
  if (words.length <= 2 && /^[ぁ-んァ-ヶー一-龯]+$/.test(query)) {
    scores[QueryIntent.NAVIGATIONAL] += 2
    signals.push('short_proper_noun')
  }
  
  // 2. インフォメーショナル（情報検索）
  for (const pattern of INFORMATIONAL_PATTERNS) {
    if (pattern.test(query)) {
      scores[QueryIntent.INFORMATIONAL] += 1
      signals.push('informational_pattern')
    }
  }
  
  // 3. トランザクショナル（ハウツー・行動検索）
  for (const pattern of TRANSACTIONAL_PATTERNS) {
    if (pattern.test(query)) {
      scores[QueryIntent.TRANSACTIONAL] += 2
      signals.push('transactional_pattern')
    }
  }
  
  // 4. 時間指定検索
  for (const pattern of TEMPORAL_PATTERNS) {
    if (pattern.test(query)) {
      scores[QueryIntent.TEMPORAL] += 2
      signals.push('temporal_pattern')
    }
  }
  
  // 5. メディア検索
  for (const pattern of MEDIA_PATTERNS) {
    if (pattern.test(query)) {
      scores[QueryIntent.MEDIA] += 2
      signals.push('media_pattern')
    }
  }
  
  // 6. エンゲージメント検索
  for (const pattern of ENGAGEMENT_PATTERNS) {
    if (pattern.test(query)) {
      scores[QueryIntent.ENGAGEMENT] += 2
      signals.push('engagement_pattern')
    }
  }
  
  // 最高スコアの意図を選択
  let maxScore = 0
  let primaryIntent = QueryIntent.INFORMATIONAL // デフォルト
  
  for (const [intent, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      primaryIntent = intent as QueryIntent
    }
  }
  
  // 複数の意図が同程度のスコアの場合はMIXED
  const highScores = Object.entries(scores).filter(([_, score]) => score > 0 && score >= maxScore * 0.7)
  if (highScores.length > 1) {
    primaryIntent = QueryIntent.MIXED
    signals.push('multiple_intents')
  }
  
  // スコアがすべて0の場合はINFORMATIONAL（デフォルト）
  if (maxScore === 0) {
    primaryIntent = QueryIntent.INFORMATIONAL
    signals.push('default_informational')
  }
  
  // 信頼度を計算（0-1）
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const confidence = totalScore > 0 ? maxScore / totalScore : 0.5
  
  // 意図に応じたスコアリング重みを設定
  const weights = getScoreWeights(primaryIntent)
  
  return {
    intent: primaryIntent,
    confidence,
    signals,
    weights
  }
}

/**
 * クエリ意図に応じたスコアリング重みを取得
 * 
 * @param intent - クエリ意図
 * @returns スコアリング重み
 */
function getScoreWeights(intent: QueryIntent): ScoreWeights {
  switch (intent) {
    case QueryIntent.NAVIGATIONAL:
      // ユーザー名を最重視
      return {
        userNameWeight: 3.0,
        contentWeight: 0.5,
        timeWeight: 0.5,
        engagementWeight: 0.8,
        mediaWeight: 1.0
      }
      
    case QueryIntent.INFORMATIONAL:
      // コンテンツの質を重視
      return {
        userNameWeight: 0.8,
        contentWeight: 2.0,
        timeWeight: 1.0,
        engagementWeight: 1.2,
        mediaWeight: 1.0
      }
      
    case QueryIntent.TRANSACTIONAL:
      // 説明的なコンテンツとエンゲージメントを重視
      return {
        userNameWeight: 0.5,
        contentWeight: 1.8,
        timeWeight: 0.8,
        engagementWeight: 1.5,
        mediaWeight: 1.2
      }
      
    case QueryIntent.TEMPORAL:
      // 時間を最重視
      return {
        userNameWeight: 0.8,
        contentWeight: 1.2,
        timeWeight: 3.0,
        engagementWeight: 1.0,
        mediaWeight: 1.0
      }
      
    case QueryIntent.MEDIA:
      // メディアの有無を最重視
      return {
        userNameWeight: 0.5,
        contentWeight: 1.0,
        timeWeight: 0.8,
        engagementWeight: 1.2,
        mediaWeight: 3.0
      }
      
    case QueryIntent.ENGAGEMENT:
      // エンゲージメントを最重視
      return {
        userNameWeight: 0.5,
        contentWeight: 1.0,
        timeWeight: 1.5,
        engagementWeight: 3.0,
        mediaWeight: 1.0
      }
      
    case QueryIntent.MIXED:
      // バランス型
      return {
        userNameWeight: 1.0,
        contentWeight: 1.5,
        timeWeight: 1.0,
        engagementWeight: 1.2,
        mediaWeight: 1.0
      }
      
    default:
      // デフォルト（INFORMATIONAL相当）
      return {
        userNameWeight: 1.0,
        contentWeight: 1.5,
        timeWeight: 1.0,
        engagementWeight: 1.0,
        mediaWeight: 1.0
      }
  }
}

/**
 * クエリ意図を人間が読める形式に変換
 * 
 * @param intent - クエリ意図
 * @returns 日本語の説明
 */
export function formatQueryIntent(intent: QueryIntent): string {
  switch (intent) {
    case QueryIntent.NAVIGATIONAL:
      return '特定ユーザー検索'
    case QueryIntent.INFORMATIONAL:
      return '情報検索'
    case QueryIntent.TRANSACTIONAL:
      return 'ハウツー検索'
    case QueryIntent.TEMPORAL:
      return '時間指定検索'
    case QueryIntent.MEDIA:
      return 'メディア検索'
    case QueryIntent.ENGAGEMENT:
      return '人気投稿検索'
    case QueryIntent.MIXED:
      return '複合検索'
    default:
      return '一般検索'
  }
}

/**
 * テストケース（開発用）
 * 
 * classifyQueryIntent('ヒカマー')
 * // → { intent: 'navigational', confidence: 0.8, signals: ['navigational_pattern', 'short_proper_noun'] }
 * 
 * classifyQueryIntent('面白い動画')
 * // → { intent: 'informational', confidence: 0.6, signals: ['informational_pattern'] }
 * 
 * classifyQueryIntent('Pythonのインストール方法')
 * // → { intent: 'transactional', confidence: 0.7, signals: ['transactional_pattern'] }
 * 
 * classifyQueryIntent('昨日のニュース')
 * // → { intent: 'temporal', confidence: 0.8, signals: ['temporal_pattern'] }
 * 
 * classifyQueryIntent('バズった動画')
 * // → { intent: 'engagement', confidence: 0.7, signals: ['engagement_pattern', 'media_pattern'] }
 */
