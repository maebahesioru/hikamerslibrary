/**
 * 時間表現の抽出と正規化
 * 「昨日」「先週」「3日前」などを日付範囲に変換
 */

export interface DateRange {
  start: Date
  end: Date
}

export interface TimeExtractionResult {
  originalQuery: string
  cleanedQuery: string
  dateRange: DateRange | null
  timeExpression: string | null
}

/**
 * 相対的な時間表現のパターン
 */
const RELATIVE_TIME_PATTERNS = [
  // 今日、昨日、明日
  { pattern: /今日|きょう|本日/g, days: 0, label: '今日' },
  { pattern: /昨日|きのう/g, days: -1, label: '昨日' },
  { pattern: /一昨日|おととい/g, days: -2, label: '一昨日' },
  { pattern: /明日|あした/g, days: 1, label: '明日' },
  { pattern: /明後日|あさって/g, days: 2, label: '明後日' },
  
  // X日前/後
  { pattern: /(\d+)日前/g, daysFromMatch: (match: RegExpMatchArray) => -parseInt(match[1]), label: 'X日前' },
  { pattern: /(\d+)日後/g, daysFromMatch: (match: RegExpMatchArray) => parseInt(match[1]), label: 'X日後' },
  
  // 今週、先週、来週
  { pattern: /今週|こんしゅう/g, weeks: 0, label: '今週' },
  { pattern: /先週|せんしゅう/g, weeks: -1, label: '先週' },
  { pattern: /先々週|せんせんしゅう/g, weeks: -2, label: '先々週' },
  { pattern: /来週|らいしゅう/g, weeks: 1, label: '来週' },
  
  // X週間前/後
  { pattern: /(\d+)週間前/g, weeksFromMatch: (match: RegExpMatchArray) => -parseInt(match[1]), label: 'X週間前' },
  { pattern: /(\d+)週間後/g, weeksFromMatch: (match: RegExpMatchArray) => parseInt(match[1]), label: 'X週間後' },
  
  // 今月、先月、来月
  { pattern: /今月|こんげつ/g, months: 0, label: '今月' },
  { pattern: /先月|せんげつ/g, months: -1, label: '先月' },
  { pattern: /先々月|せんせんげつ/g, months: -2, label: '先々月' },
  { pattern: /来月|らいげつ/g, months: 1, label: '来月' },
  
  // Xヶ月前/後
  { pattern: /(\d+)ヶ月前|(\d+)か月前|(\d+)カ月前/g, monthsFromMatch: (match: RegExpMatchArray) => -parseInt(match[1] || match[2] || match[3]), label: 'Xヶ月前' },
  { pattern: /(\d+)ヶ月後|(\d+)か月後|(\d+)カ月後/g, monthsFromMatch: (match: RegExpMatchArray) => parseInt(match[1] || match[2] || match[3]), label: 'Xヶ月後' },
  
  // 今年、去年、来年
  { pattern: /今年|ことし/g, years: 0, label: '今年' },
  { pattern: /去年|昨年|きょねん/g, years: -1, label: '去年' },
  { pattern: /一昨年|おととし/g, years: -2, label: '一昨年' },
  { pattern: /来年|らいねん/g, years: 1, label: '来年' },
]

/**
 * 絶対的な時間表現のパターン
 */
const ABSOLUTE_TIME_PATTERNS = [
  // YYYY年MM月DD日
  { pattern: /(\d{4})年(\d{1,2})月(\d{1,2})日/g, type: 'full' as const },
  // MM月DD日
  { pattern: /(\d{1,2})月(\d{1,2})日/g, type: 'monthDay' as const },
  // YYYY/MM/DD
  { pattern: /(\d{4})\/(\d{1,2})\/(\d{1,2})/g, type: 'slash' as const },
  // YYYY-MM-DD
  { pattern: /(\d{4})-(\d{1,2})-(\d{1,2})/g, type: 'hyphen' as const },
]

/**
 * 日付範囲を計算
 */
function calculateDateRange(
  days?: number,
  weeks?: number,
  months?: number,
  years?: number
): DateRange {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)
  
  // 時刻を00:00:00にリセット
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  
  if (days !== undefined) {
    start.setDate(start.getDate() + days)
    end.setDate(end.getDate() + days)
  }
  
  if (weeks !== undefined) {
    if (weeks === 0) {
      // 今週: 月曜日から日曜日
      const dayOfWeek = start.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // 月曜日を週の始まりとする
      start.setDate(start.getDate() + diff)
      end.setDate(start.getDate() + 6)
    } else {
      // X週間前/後
      start.setDate(start.getDate() + weeks * 7)
      end.setDate(end.getDate() + weeks * 7)
      
      // 週の範囲に調整
      const dayOfWeek = start.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      start.setDate(start.getDate() + diff)
      end.setDate(start.getDate() + 6)
    }
  }
  
  if (months !== undefined) {
    if (months === 0) {
      // 今月: 1日から月末
      start.setDate(1)
      end.setMonth(end.getMonth() + 1)
      end.setDate(0) // 前月の最終日 = 今月の最終日
    } else {
      start.setMonth(start.getMonth() + months)
      end.setMonth(end.getMonth() + months)
      
      // 月の範囲に調整
      start.setDate(1)
      end.setMonth(end.getMonth() + 1)
      end.setDate(0)
    }
  }
  
  if (years !== undefined) {
    if (years === 0) {
      // 今年: 1月1日から12月31日
      start.setMonth(0, 1)
      end.setMonth(11, 31)
    } else {
      start.setFullYear(start.getFullYear() + years)
      end.setFullYear(end.getFullYear() + years)
      
      // 年の範囲に調整
      start.setMonth(0, 1)
      end.setMonth(11, 31)
    }
  }
  
  return { start, end }
}

/**
 * 絶対的な日付を解析
 */
function parseAbsoluteDate(match: RegExpMatchArray, type: string): DateRange | null {
  const now = new Date()
  let year: number
  let month: number
  let day: number
  
  switch (type) {
    case 'full':
      year = parseInt(match[1])
      month = parseInt(match[2]) - 1
      day = parseInt(match[3])
      break
      
    case 'monthDay':
      year = now.getFullYear()
      month = parseInt(match[1]) - 1
      day = parseInt(match[2])
      break
      
    case 'slash':
    case 'hyphen':
      year = parseInt(match[1])
      month = parseInt(match[2]) - 1
      day = parseInt(match[3])
      break
      
    default:
      return null
  }
  
  // 日付の妥当性チェック
  const date = new Date(year, month, day)
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null
  }
  
  const start = new Date(year, month, day, 0, 0, 0, 0)
  const end = new Date(year, month, day, 23, 59, 59, 999)
  
  return { start, end }
}

/**
 * クエリから時間表現を抽出して正規化
 * 
 * @param query - 検索クエリ
 * @returns 時間抽出結果
 */
export function extractTimeExpression(query: string): TimeExtractionResult {
  let cleanedQuery = query
  let dateRange: DateRange | null = null
  let timeExpression: string | null = null
  
  // 1. 相対的な時間表現を検索
  for (const pattern of RELATIVE_TIME_PATTERNS) {
    const matches = Array.from(query.matchAll(pattern.pattern))
    
    if (matches.length > 0) {
      const match = matches[0]
      timeExpression = match[0]
      
      // 日付範囲を計算
      if ('daysFromMatch' in pattern && pattern.daysFromMatch) {
        const days = pattern.daysFromMatch(match)
        dateRange = calculateDateRange(days)
      } else if ('weeksFromMatch' in pattern && pattern.weeksFromMatch) {
        const weeks = pattern.weeksFromMatch(match)
        dateRange = calculateDateRange(undefined, weeks)
      } else if ('monthsFromMatch' in pattern && pattern.monthsFromMatch) {
        const months = pattern.monthsFromMatch(match)
        dateRange = calculateDateRange(undefined, undefined, months)
      } else {
        dateRange = calculateDateRange(
          'days' in pattern ? pattern.days : undefined,
          'weeks' in pattern ? pattern.weeks : undefined,
          'months' in pattern ? pattern.months : undefined,
          'years' in pattern ? pattern.years : undefined
        )
      }
      
      // クエリから時間表現を除去
      cleanedQuery = cleanedQuery.replace(pattern.pattern, '').trim()
      
      // 最初にマッチしたものを使用
      break
    }
  }
  
  // 2. 絶対的な時間表現を検索（相対的な表現が見つからなかった場合）
  if (!dateRange) {
    for (const pattern of ABSOLUTE_TIME_PATTERNS) {
      const matches = Array.from(query.matchAll(pattern.pattern))
      
      if (matches.length > 0) {
        const match = matches[0]
        timeExpression = match[0]
        dateRange = parseAbsoluteDate(match, pattern.type)
        
        // クエリから時間表現を除去
        cleanedQuery = cleanedQuery.replace(pattern.pattern, '').trim()
        
        break
      }
    }
  }
  
  // 前後の助詞や記号を除去
  cleanedQuery = cleanedQuery
    .replace(/^[のにでから\s]+/, '')
    .replace(/[のにでから\s]+$/, '')
    .trim()
  
  return {
    originalQuery: query,
    cleanedQuery: cleanedQuery || query, // 空になった場合は元のクエリを返す
    dateRange,
    timeExpression
  }
}

/**
 * 日付範囲内のツイートをフィルタリング
 * 
 * @param tweets - ツイートの配列
 * @param dateRange - 日付範囲
 * @returns フィルタリングされたツイート
 */
export function filterTweetsByDateRange<T extends { createdAt: string }>(
  tweets: T[],
  dateRange: DateRange
): T[] {
  return tweets.filter(tweet => {
    const tweetDate = new Date(tweet.createdAt.replace(' JST', '+09:00'))
    return tweetDate >= dateRange.start && tweetDate <= dateRange.end
  })
}

/**
 * 日付範囲を人間が読める形式に変換
 * 
 * @param dateRange - 日付範囲
 * @returns フォーマットされた文字列
 */
export function formatDateRange(dateRange: DateRange): string {
  const start = dateRange.start
  const end = dateRange.end
  
  // 同じ日の場合
  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()
  ) {
    return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日`
  }
  
  // 同じ月の場合
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日〜${end.getDate()}日`
  }
  
  // 同じ年の場合
  if (start.getFullYear() === end.getFullYear()) {
    return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日〜${end.getMonth() + 1}月${end.getDate()}日`
  }
  
  // 異なる年の場合
  return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日〜${end.getFullYear()}年${end.getMonth() + 1}月${end.getDate()}日`
}

/**
 * テストケース（開発用）
 * 
 * extractTimeExpression('昨日の動画')
 * // → { cleanedQuery: '動画', dateRange: { start: 2025-11-06, end: 2025-11-06 }, timeExpression: '昨日' }
 * 
 * extractTimeExpression('先週のニュース')
 * // → { cleanedQuery: 'ニュース', dateRange: { start: 2025-10-27, end: 2025-11-02 }, timeExpression: '先週' }
 * 
 * extractTimeExpression('3日前のツイート')
 * // → { cleanedQuery: 'ツイート', dateRange: { start: 2025-11-04, end: 2025-11-04 }, timeExpression: '3日前' }
 * 
 * extractTimeExpression('2025年1月1日の投稿')
 * // → { cleanedQuery: '投稿', dateRange: { start: 2025-01-01, end: 2025-01-01 }, timeExpression: '2025年1月1日' }
 */
