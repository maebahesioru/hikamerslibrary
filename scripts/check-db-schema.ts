import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkSchema() {
  await client.connect();
  
  // Get all tables
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  
  console.log('📊 Tables:', tables.rows.map(r => r.table_name));
  
  // Get schema for tweets table (most likely name)
  const tweetsSchema = await client.query(`
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns
    WHERE table_name = 'tweets'
    ORDER BY ordinal_position
  `);
  
  console.log('\n🐦 Tweets table schema:');
  tweetsSchema.rows.forEach(col => {
    console.log(`  ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
  });
  
  // Sample data
  const sample = await client.query('SELECT * FROM tweets LIMIT 1');
  console.log('\n📝 Sample tweet:', JSON.stringify(sample.rows[0], null, 2));
  
  await client.end();
}

checkSchema().catch(console.error);
