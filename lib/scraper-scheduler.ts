/**
 * スクレイパー自動スケジューラー
 * サーバー起動時に呼ばれ、毎日決まった時間にスクレイパーを実行する
 */

const SCRAPER_SECRET = process.env.SCRAPER_SECRET || 'hikamers-scraper-2026'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// 実行時刻: 毎日 深夜0:00 JST = 前日15:00 UTC
const RUN_HOUR_UTC = 15
const RUN_MINUTE = 0

function getNextRunTime(): Date {
  const now = new Date()
  const next = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    RUN_HOUR_UTC,
    RUN_MINUTE,
    0,
    0
  ))
  
  // 今日の実行時刻を過ぎてたら明日に
  if (next <= now) {
    next.setUTCDate(next.getUTCDate() + 1)
  }
  
  return next
}

function formatJST(date: Date): string {
  return date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
}

async function runScraper(): Promise<void> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().slice(0, 10)

  const baseUrl = SITE_URL.replace(/\/$/, '')
  const url = `${baseUrl}/api/admin/scraper?date=${dateStr}&secret=${SCRAPER_SECRET}`

  console.log(`[Scraper Scheduler] Running: ${dateStr} -> ${url.replace(SCRAPER_SECRET, '***')}`)
  
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 600_000) // 10分
    
    const res = await fetch(url, { 
      method: 'POST',
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const data = await res.json()
    console.log(`[Scraper Scheduler] Done: ${data.tweetsFound || 0} tweets, exit=${data.exitCode}`)
  } catch (err) {
    console.error('[Scraper Scheduler] Failed:', err)
  }
}

let timer: ReturnType<typeof setTimeout> | null = null

export function scheduleDailyScraper(): void {
  if (typeof setInterval === 'undefined') return // Edgeランタイム対策
  
  const nextRun = getNextRunTime()
  const delayMs = nextRun.getTime() - Date.now()
  
  console.log(`[Scraper Scheduler] Next run: ${formatJST(nextRun)} JST (in ${Math.round(delayMs / 1000 / 60)} min)`)

  // 初回実行をスケジュール
  timer = setTimeout(async () => {
    await runScraper()
    
    // 以降24時間ごとに実行
    timer = setInterval(async () => {
      await runScraper()
    }, 24 * 60 * 60 * 1000)
  }, delayMs)
}

// プロセス終了時にクリーンアップ
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    if (timer) clearTimeout(timer)
    if (timer) clearInterval(timer)
  })
}
