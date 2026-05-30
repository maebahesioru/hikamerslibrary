import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export const dynamic = 'force-dynamic'
export const maxDuration = 600

const SCRAPER_SECRET = process.env.SCRAPER_SECRET || 'hikamers-scraper-2026'

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  if (auth === `Bearer ${SCRAPER_SECRET}`) return true
  const url = new URL(request.url)
  if (url.searchParams.get('secret') === SCRAPER_SECRET) return true
  return false
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const date = url.searchParams.get('date') || ''
  const dryRun = url.searchParams.has('dry-run')

  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format (YYYY-MM-DD)' }, { status: 400 })
  }

  const scraperDir = path.join(process.cwd(), 'Yahoo-Realtime-Search-Scraper')
  // プロキシローテーション付きラッパーを使用
  const wrapperScript = path.join(scraperDir, 'run_scraper_proxy_rotate.py')

  // 結果ファイル（終了コードが取れなかったときのバックアップ）
  const resultFile = path.join(scraperDir, '.last_result.json')

  // Build arguments for the wrapper (wraps cli_scraper.py)
  const args = [wrapperScript]
  if (date) {
    args.push('--date', date)
  }
  args.push('--timeout', '10')
  args.push('--parallel', '5')
  if (dryRun) {
    args.push('--tsv-only')
  }

  const env = {
    ...process.env,
    PYTHONUNBUFFERED: '1',
    RESULT_FILE: resultFile,
    YAHOO_PROXY: process.env.YAHOO_PROXY || '',
    DATABASE_URL: process.env.DATABASE_URL || '',
  }

  return new Promise<Response>((resolve) => {
    const proc = spawn('python3', args, {
      cwd: scraperDir,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString()
      if (stdout.length > 100000) {
        stdout = stdout.slice(-80000)
      }
    })

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
      if (stderr.length > 10000) {
        stderr = stderr.slice(-8000)
      }
    })

    proc.on('close', async (code: number) => {
      // 結果ファイルがあれば読み込む
      let resultData: any = {}
      try {
        const fs = await import('fs/promises')
        const resultContent = await fs.readFile(resultFile, 'utf-8')
        resultData = JSON.parse(resultContent)
        // クリーンアップ
        await fs.unlink(resultFile).catch(() => {})
      } catch {}

      // Extract from stdout as fallback
      const tweetMatch = stdout.match(/(\d+)件のツイートを取得/)
      const dbMatch = stdout.match(/DB総件数: ([\d,]+)件/)
      const errorMatch = stdout.match(/✗\s*(.+)/g)
      const proxyMatch = stdout.match(/使用プロキシ: (.+?) \(/)
      const proxyMatch2 = stdout.match(/➡ 使用プロキシ: (.+)/)

      resolve(NextResponse.json({
        success: code === 0,
        exitCode: code,
        tweetsFound: resultData.tweets_found || (tweetMatch ? parseInt(tweetMatch[1]) : 0),
        dbTotal: resultData.db_total || (dbMatch ? dbMatch[1] : null),
        proxyUsed: proxyMatch?.[1] || proxyMatch2?.[1] || resultData.proxy || 'unknown',
        errors: errorMatch || [],
        dryRun,
        date: date || 'yesterday',
        outputTail: stdout.slice(-3000),
      }))
    })

    proc.on('error', (err: Error) => {
      resolve(NextResponse.json({
        success: false,
        error: `Failed to start scraper: ${err.message}`,
      }, { status: 500 }))
    })
  })
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    status: 'ok',
    usage: 'POST /api/admin/scraper?date=YYYY-MM-DD&secret=...',
    params: {
      date: 'Optional. YYYY-MM-DD format. Default: yesterday',
      'dry-run': 'Optional. TSV only, no DB write',
    },
    proxy_rotation: 'auto-detects working Japanese HTTP proxies at each run',
  })
}
