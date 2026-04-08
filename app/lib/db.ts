// PostgreSQL接続ラッパー（タグ付きテンプレートリテラル対応）
import { Pool, PoolClient } from 'pg'

// PostgreSQL接続プール（サーバーレス環境対応）
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      throw new Error('DATABASE_URL must be set')
    }
    
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: false
    })
    
    pool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err)
    })
  }
  
  return pool
}

// クエリ実行ヘルパー（通常の関数として）
export async function query(sqlString: string, args: any[] = []): Promise<any[]> {
  const pool = getPool()
  const result = await pool.query(sqlString, args)
  return result.rows
}

// 単一行取得
export async function queryOne(sqlString: string, args: any[] = []): Promise<any | null> {
  const rows = await query(sqlString, args)
  return rows[0] || null
}

// タグ付きテンプレートリテラル形式のsql関数
export function sql(strings: TemplateStringsArray, ...values: any[]) {
  // SQL文とパラメータを構築
  let text = strings[0]
  const args: any[] = []
  
  for (let i = 0; i < values.length; i++) {
    if (Array.isArray(values[i])) {
      // 配列の場合（IN句など）、展開
      const placeholders = values[i].map((_: any, idx: number) => `$${args.length + idx + 1}`).join(', ')
      text += placeholders + strings[i + 1]
      args.push(...values[i])
    } else {
      // 通常の値
      args.push(values[i])
      text += `$${args.length}` + strings[i + 1]
    }
  }
  
  return {
    text,
    values: args,
    // thenableとして実装（await可能）
    then(resolve: (value: { rows: any[] }) => void, reject: (reason: any) => void) {
      const pool = getPool()
      pool.query(text, args)
        .then(result => resolve({ rows: result.rows }))
        .catch(reject)
    }
  }
}

// トランザクション実行ヘルパー
export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
