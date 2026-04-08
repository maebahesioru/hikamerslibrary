import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/postgres'

// ヘッダー（tech.mdのスキーマに準拠）
const HEADERS = [
  'id', 'createdAt', 'displayText', 'lang', 'source',
  'replyCount', 'rtCount', 'qtCount', 'likesCount', 'viewCount', 'bookmarkCount',
  'mediaType', 'media', 'urls', 'hashtags', 'mentions',
  'inReplyToUserId', 'inReplyToScreenName', 'inReplyToTweetId',
  'quotedTweetId', 'quotedTweetText',
  'userId', 'userName', 'userRestId', 'userDescription',
  'userFollowersCount', 'userFollowingCount', 'userTweetCount', 'userCreatedAt',
  'userProfileImageUrl', 'userProfileBannerUrl', 'userVerified', 'userLocation'
]

// DBカラム名マッピング
const DB_COLUMNS = [
  'id', 'created_at', 'display_text', 'lang', 'source',
  'reply_count', 'rt_count', 'qt_count', 'likes_count', 'view_count', 'bookmark_count',
  'media_type', 'media', 'urls', 'hashtags', 'mentions',
  'in_reply_to_user_id', 'in_reply_to_screen_name', 'in_reply_to_tweet_id',
  'quoted_tweet_id', 'quoted_tweet_text',
  'user_id', 'user_name', 'user_rest_id', 'user_description',
  'user_followers_count', 'user_following_count', 'user_tweet_count', 'user_created_at',
  'user_profile_image_url', 'user_profile_banner_url', 'user_verified', 'user_location'
]

type ExportFormat = 'tsv' | 'csv' | 'json' | 'jsonl' | 'xml' | 'sql' | 'yaml' | 'html' | 'md'

function escapeForTsv(value: any): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  return str.replace(/\t/g, ' ').replace(/\n/g, '\\n').replace(/\r/g, '')
}

function escapeForCsv(value: any): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function escapeForXml(value: any): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function escapeForSql(value: any): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  return `'${String(value).replace(/'/g, "''")}'`
}

function escapeForYaml(value: any): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  const str = String(value)
  if (str.includes('\n') || str.includes(':') || str.includes('#') || str.includes("'") || str.includes('"') || /^[\[\]{}&*!|>%@`]/.test(str)) {
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
  }
  return str
}

function escapeForHtml(value: any): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeForMd(value: any): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ')
    .slice(0, 50) + (String(value).length > 50 ? '...' : '')
}

function rowToObject(row: any): Record<string, any> {
  const obj: Record<string, any> = {}
  DB_COLUMNS.forEach((col, i) => {
    obj[HEADERS[i]] = row[col] ?? null
  })
  return obj
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const format = (searchParams.get('format') || 'tsv') as ExportFormat
  
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date parameter required (YYYY-MM-DD format)' }, { status: 400 })
  }
  
  const validFormats: ExportFormat[] = ['tsv', 'csv', 'json', 'jsonl', 'xml', 'sql', 'yaml', 'html', 'md']
  if (!validFormats.includes(format)) {
    return NextResponse.json({ error: `Invalid format. Supported: ${validFormats.join(', ')}` }, { status: 400 })
  }
  
  try {
    const pool = getPool()
    
    const result = await pool.query(`
      SELECT ${DB_COLUMNS.join(', ')}
      FROM tweets
      WHERE DATE(created_at) = $1
      ORDER BY created_at ASC
    `, [date])
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No tweets found for this date' }, { status: 404 })
    }
    
    let content: string
    let contentType: string
    let extension: string
    
    switch (format) {
      case 'tsv':
        content = [HEADERS.join('\t'), ...result.rows.map(row => 
          DB_COLUMNS.map(col => escapeForTsv(row[col])).join('\t')
        )].join('\n')
        contentType = 'text/tab-separated-values; charset=utf-8'
        extension = 'tsv'
        break
        
      case 'csv':
        content = [HEADERS.join(','), ...result.rows.map(row => 
          DB_COLUMNS.map(col => escapeForCsv(row[col])).join(',')
        )].join('\n')
        contentType = 'text/csv; charset=utf-8'
        extension = 'csv'
        break
        
      case 'json':
        content = JSON.stringify(result.rows.map(rowToObject), null, 2)
        contentType = 'application/json; charset=utf-8'
        extension = 'json'
        break
        
      case 'jsonl':
        content = result.rows.map(row => JSON.stringify(rowToObject(row))).join('\n')
        contentType = 'application/x-ndjson; charset=utf-8'
        extension = 'jsonl'
        break
        
      case 'xml':
        const xmlRows = result.rows.map(row => {
          const obj = rowToObject(row)
          const fields = Object.entries(obj)
            .map(([k, v]) => `    <${k}>${escapeForXml(v)}</${k}>`)
            .join('\n')
          return `  <tweet>\n${fields}\n  </tweet>`
        }).join('\n')
        content = `<?xml version="1.0" encoding="UTF-8"?>\n<tweets date="${date}" count="${result.rows.length}">\n${xmlRows}\n</tweets>`
        contentType = 'application/xml; charset=utf-8'
        extension = 'xml'
        break
        
      case 'sql':
        const sqlRows = result.rows.map(row => {
          const values = DB_COLUMNS.map(col => escapeForSql(row[col])).join(', ')
          return `INSERT INTO tweets (${HEADERS.join(', ')}) VALUES (${values});`
        }).join('\n')
        content = `-- Tweets for ${date}\n-- ${result.rows.length} rows\n\n${sqlRows}`
        contentType = 'application/sql; charset=utf-8'
        extension = 'sql'
        break
        
      case 'yaml':
        const yamlRows = result.rows.map(row => {
          const obj = rowToObject(row)
          const fields = Object.entries(obj)
            .map(([k, v]) => `    ${k}: ${escapeForYaml(v)}`)
            .join('\n')
          return `  - \n${fields}`
        }).join('\n')
        content = `# Tweets for ${date}\n# ${result.rows.length} rows\ntweets:\n${yamlRows}`
        contentType = 'text/yaml; charset=utf-8'
        extension = 'yaml'
        break
        
      case 'html':
        const htmlHeaders = HEADERS.map(h => `<th>${h}</th>`).join('')
        const htmlRows = result.rows.map(row => {
          const cells = DB_COLUMNS.map(col => `<td>${escapeForHtml(row[col])}</td>`).join('')
          return `<tr>${cells}</tr>`
        }).join('\n')
        content = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Tweets - ${date}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 20px; background: #1a1a2e; color: #eee; }
    h1 { color: #8ab4f8; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; }
    th, td { border: 1px solid #333; padding: 8px; text-align: left; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    th { background: #2d2d44; position: sticky; top: 0; }
    tr:hover { background: #2d2d44; }
  </style>
</head>
<body>
  <h1>Tweets - ${date}</h1>
  <p>${result.rows.length.toLocaleString()} tweets</p>
  <table>
    <thead><tr>${htmlHeaders}</tr></thead>
    <tbody>${htmlRows}</tbody>
  </table>
</body>
</html>`
        contentType = 'text/html; charset=utf-8'
        extension = 'html'
        break
        
      case 'md':
        const mdHeaders = '| ' + HEADERS.slice(0, 8).join(' | ') + ' |'
        const mdSeparator = '| ' + HEADERS.slice(0, 8).map(() => '---').join(' | ') + ' |'
        const mdRows = result.rows.map(row => {
          const cells = DB_COLUMNS.slice(0, 8).map(col => escapeForMd(row[col])).join(' | ')
          return `| ${cells} |`
        }).join('\n')
        content = `# Tweets - ${date}\n\n${result.rows.length.toLocaleString()} tweets\n\n${mdHeaders}\n${mdSeparator}\n${mdRows}`
        contentType = 'text/markdown; charset=utf-8'
        extension = 'md'
        break
        
      default:
        return NextResponse.json({ error: 'Unknown format' }, { status: 400 })
    }
    
    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${date}.${extension}"`,
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error: any) {
    console.error('[Download] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
