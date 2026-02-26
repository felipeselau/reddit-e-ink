import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.ts';

function getDbUrl(): string {
  const dbUrl = Deno.env.get('DATABASE_URL');
  if (!dbUrl) {
    return 'file:./data.db';
  }
  if (dbUrl.startsWith('libsql://')) {
    return dbUrl.replace('libsql://', 'https://');
  }
  return dbUrl;
}

const client = createClient({
  url: getDbUrl(),
});

export const db = drizzle(client, { schema });

const DEFAULT_SUBSCRIPTIONS = [
  'programming', 'technology', 'science', 'worldnews', 
  'linux', 'javascript', 'rust', 'python'
];

export async function initDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS subreddits (
      name TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      is_favorite INTEGER DEFAULT 0 NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS feed_cache (
      subreddit TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      fetched_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subreddit TEXT NOT NULL UNIQUE,
      is_homepage INTEGER DEFAULT 0 NOT NULL,
      added_at INTEGER NOT NULL
    )
  `);
  
  const existing = await client.execute('SELECT COUNT(*) as count FROM subscriptions');
  if (existing.rows[0].count === 0) {
    for (const sub of DEFAULT_SUBSCRIPTIONS) {
      await client.execute(
        'INSERT INTO subscriptions (subreddit, added_at) VALUES (?, ?)',
        [sub, Date.now()]
      );
    }
    console.log('Default subscriptions added');
  }
  
  console.log('Database initialized');
}
