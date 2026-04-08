/**
 * 統合クエリ処理システム
 * 時間表現、クエリ意図、エンティティ認識を統合
 */

import { extractTimeExpression, DateRange, formatDateRange } from './timeExpression'
import { classifyQueryIntent, QueryIntent, QueryIntentResult } from './queryIntent'
import { extractEntities, extractEntitiesAsync, Entity, EntityType } from './entityRecognition'

export interface ProcessedQuery {
  // 元のクエリ
  originalQuery: string
  
  // クリーンアップされたクエリ
  cleanedQuery: string
  
  // 時間表現
  timeExpression: string | null
  dateRange: DateRange | null
  
  // クエリ意図
  intent: QueryIntentResult
  
  // エンティティ
  entities: Entity[]
  
  // 検索キーワード（最終的に使用）
  searchKeywords: string[]
  
  // メタデータ
  metadata: {
    hasTimeFilter: boolean
    hasMentions: boolean
    hasHashtags: boolean
    hasPersonNames: boolean
    hasLocations: boolean
    isUserSearch: boolean
  }
}

/**
 * クエリを包括的に処理（同期版 - 正規表現のみ）
 * 
 * @param query - 検索クエリ
 * @returns 処理されたクエリ情報
 */
export async function processQueryAsync(query: string): Promise<ProcessedQuery> {
  const timeResult = extractTimeExpression(query)
  const entityResult = await extractEntitiesAsync(timeResult.cleanedQuery)
  const intentResult = classifyQueryIntent(entityResult.cleanedQuery)
  let finalQuery = entityResult.cleanedQuery
    .replace(/^[\u306E\u306B\u3067\u304B\u3089\s]+/, '')
    .replace(/[\u306E\u306B\u3067\u304B\u3089\s]+$/, '')
    .trim()
  const searchKeywords = generateSearchKeywords(finalQuery, entityResult.entities, intentResult.intent)
  const metadata = {
    hasTimeFilter: timeResult.dateRange !== null,
    hasMentions: entityResult.entities.some((e: Entity) => e.type === EntityType.MENTION),
    hasHashtags: entityResult.entities.some((e: Entity) => e.type === EntityType.HASHTAG),
    hasPersonNames: entityResult.entities.some((e: Entity) => e.type === EntityType.PERSON),
    hasLocations: entityResult.entities.some((e: Entity) => e.type === EntityType.LOCATION),
    isUserSearch: intentResult.intent === QueryIntent.NAVIGATIONAL
  }
  return {
    originalQuery: query,
    cleanedQuery: finalQuery || query,
    timeExpression: timeResult.timeExpression,
    dateRange: timeResult.dateRange,
    intent: intentResult,
    entities: entityResult.entities,
    searchKeywords,
    metadata
  }
}

export function processQuery(query: string): ProcessedQuery {
  // 1. 時間表現の抽出
  const timeResult = extractTimeExpression(query)
  
  // 2. エンティティの抽出（時間表現を除去した後）
  const entityResult = extractEntities(timeResult.cleanedQuery)
  
  // 3. クエリ意図の分類（エンティティを除去した後）
  const intentResult = classifyQueryIntent(entityResult.cleanedQuery)
  
  // 4. 最終的なクリーンクエリ
  let finalQuery = entityResult.cleanedQuery
  
  // 助詞や記号を除去
  finalQuery = finalQuery
    .replace(/^[のにでから\s]+/, '')
    .replace(/[のにでから\s]+$/, '')
    .trim()
  
  // 5. 検索キーワードを生成
  const searchKeywords = generateSearchKeywords(
    finalQuery,
    entityResult.entities,
    intentResult.intent
  )
  
  // 6. メタデータを生成
  const metadata = {
    hasTimeFilter: timeResult.dateRange !== null,
    hasMentions: entityResult.entities.some((e: Entity) => e.type === EntityType.MENTION),
    hasHashtags: entityResult.entities.some((e: Entity) => e.type === EntityType.HASHTAG),
    hasPersonNames: entityResult.entities.some((e: Entity) => e.type === EntityType.PERSON),
    hasLocations: entityResult.entities.some((e: Entity) => e.type === EntityType.LOCATION),
    isUserSearch: intentResult.intent === QueryIntent.NAVIGATIONAL
  }
  
  return {
    originalQuery: query,
    cleanedQuery: finalQuery || query,
    timeExpression: timeResult.timeExpression,
    dateRange: timeResult.dateRange,
    intent: intentResult,
    entities: entityResult.entities,
    searchKeywords,
    metadata
  }
}

/**
 * 検索キーワードを生成
 * エンティティとクエリ意図を考慮
 */
function generateSearchKeywords(
  cleanedQuery: string,
  entities: Entity[],
  intent: QueryIntent
): string[] {
  const keywords = new Set<string>()
  
  // 1. クリーンクエリから基本キーワードを抽出
  if (cleanedQuery) {
    const words = cleanedQuery.split(/[\s　]+/).filter(w => w.length > 0)
    words.forEach(word => keywords.add(word))
  }
  
  // 2. エンティティを追加
  for (const entity of entities) {
    // メンションとハッシュタグは記号を除去
    if (entity.type === EntityType.MENTION) {
      keywords.add(entity.text) // @username
      keywords.add(entity.text.substring(1)) // username
    } else if (entity.type === EntityType.HASHTAG) {
      keywords.add(entity.text) // #hashtag
      keywords.add(entity.text.substring(1)) // hashtag
    } else if (
      entity.type === EntityType.PERSON ||
      entity.type === EntityType.LOCATION ||
      entity.type === EntityType.ORGANIZATION
    ) {
      // 人名、地名、組織名はそのまま追加
      keywords.add(entity.text)
      
      // 敬称を除去したバージョンも追加
      const withoutHonorific = entity.text.replace(/(?:さん|くん|ちゃん|様)$/, '')
      if (withoutHonorific !== entity.text) {
        keywords.add(withoutHonorific)
      }
    }
  }
  
  // 3. ナビゲーショナル検索の場合、ユーザー名を優先
  if (intent === QueryIntent.NAVIGATIONAL) {
    // メンションがある場合はそれを最優先
    const mentions = entities.filter(e => e.type === EntityType.MENTION)
    if (mentions.length > 0) {
      // メンションのみを返す
      return mentions.map(m => m.text.substring(1)) // @を除去
    }
    
    // 人名がある場合はそれを優先
    const persons = entities.filter(e => e.type === EntityType.PERSON)
    if (persons.length > 0) {
      return persons.map(p => p.text.replace(/(?:さん|くん|ちゃん|様)$/, ''))
    }
  }
  
  return Array.from(keywords).filter(k => k.length > 0)
}

/**
 * 処理結果を人間が読める形式でフォーマット
 */
export function formatProcessedQuery(processed: ProcessedQuery): string {
  const parts: string[] = []
  
  parts.push(`クエリ: "${processed.originalQuery}"`)
  
  if (processed.cleanedQuery !== processed.originalQuery) {
    parts.push(`クリーンクエリ: "${processed.cleanedQuery}"`)
  }
  
  if (processed.timeExpression) {
    parts.push(`時間: ${processed.timeExpression}`)
    if (processed.dateRange) {
      parts.push(`  → ${formatDateRange(processed.dateRange)}`)
    }
  }
  
  parts.push(`意図: ${formatQueryIntent(processed.intent.intent)} (信頼度: ${(processed.intent.confidence * 100).toFixed(0)}%)`)
  
  if (processed.entities.length > 0) {
    parts.push(`エンティティ:`)
    for (const entity of processed.entities) {
      parts.push(`  - ${entity.text} (${formatEntityType(entity.type)})`)
    }
  }
  
  parts.push(`検索キーワード: [${processed.searchKeywords.join(', ')}]`)
  
  return parts.join('\n')
}

/**
 * クエリ意図を日本語に変換（再エクスポート）
 */
function formatQueryIntent(intent: QueryIntent): string {
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
 * エンティティタイプを日本語に変換（再エクスポート）
 */
function formatEntityType(type: EntityType): string {
  switch (type) {
    case EntityType.PERSON:
      return '人名'
    case EntityType.LOCATION:
      return '地名'
    case EntityType.ORGANIZATION:
      return '組織名'
    case EntityType.PRODUCT:
      return '商品名'
    case EntityType.EVENT:
      return 'イベント名'
    case EntityType.DATE:
      return '日付'
    case EntityType.TIME:
      return '時刻'
    case EntityType.MONEY:
      return '金額'
    case EntityType.HASHTAG:
      return 'ハッシュタグ'
    case EntityType.MENTION:
      return 'メンション'
    case EntityType.URL:
      return 'URL'
    case EntityType.EMAIL:
      return 'メールアドレス'
    default:
      return '不明'
  }
}

/**
 * テストケース（開発用）
 * 
 * processQuery('ヒカマー')
 * // → ナビゲーショナル検索、人名エンティティ
 * 
 * processQuery('昨日の面白い動画')
 * // → 時間指定 + 情報検索、日付範囲あり
 * 
 * processQuery('@hikamer の最新ツイート')
 * // → ナビゲーショナル検索、メンションエンティティ
 * 
 * processQuery('東京のラーメン屋')
 * // → 情報検索、地名エンティティ
 * 
 * processQuery('Pythonのインストール方法')
 * // → トランザクショナル検索、組織名エンティティ
 */
