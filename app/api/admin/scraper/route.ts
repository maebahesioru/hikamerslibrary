
import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export const dynamic = 'force-dynamic'
export const maxDuration = 600 // 10 minutes for full scrape

// Simple secret check via Authorization header or SCRAPER_SECRET env
const SCRAPER_SECRET = process.env.SCRAPER_SECRET || 'hikamers-scraper-2026'

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  if (auth === `Bearer ${SCRAPER_SECRET}`) return true
  // Also allow ?secret= param for cron job simplicity
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
  
  // Validate date if provided
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format (YYYY-MM-DD)' }, { status: 400 })
  }

  // Path to the Python scraper script
  const scraperDir = path.join(process.cwd(), 'Yahoo-Realtime-Search-Scraper')
  const scraperScript = path.join(scraperDir, 'cli_scraper.py')

  // Build arguments
  const args = [scraperScript]
  if (date) {
    args.push('--date', date)
  }
  args.push('--timeout', '10')
  args.push('--parallel', '5')
  if (dryRun) {
    args.push('--tsv-only')
  }

  // Environment variables for the Python process
  const env = {
    ...process.env,
    PYTHONUNBUFFERED: '1',
    // Ensure .env.local values are passed through
    YAHOO_PROXY: process.env.YAHOO_PROXY || '',
    DATABASE_URL: process.env.DATABASE_URL || '',
  }

  return new Promise((resolve) => {
    const proc = spawn('python3', args, {
      cwd: scraperDir,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString()
      // Keep stdout under 100KB for response
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

    proc.on('close', (code: number) => {
      // Extract key stats from output
      const tweetMatch = stdout.match(/(\d+)件のツイートを取得/)
      const dbMatch = stdout.match(/DB総件数: ([\d,]+)件/)
      const errorMatch = stdout.match(/✗\s*(.+)/g)
      
      resolve(NextResponse.json({
        success: code === 0,
        exitCode: code,
        tweetsFound: tweetMatch ? parseInt(tweetMatch[1]) : 0,
        dbTotal: dbMatch ? dbMatch[1] : null,
        errors: errorMatch || [],
        dryRun,
        date: date || 'yesterday',
        // Return last 2000 chars of output for debugging
        outputTail: stdout.slice(-2000),
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

// GET for health check and manual trigger via browser
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
    }
  })
}
