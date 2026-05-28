/**
 * Next.js Instrumentation — サーバー起動時にスクレイパー自動スケジュール
 * 毎日 朝6時JST (UTC 21:00) にスクレイパーAPIを実行
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { scheduleDailyScraper } = await import('./lib/scraper-scheduler')
    scheduleDailyScraper()
  }
}
