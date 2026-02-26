import { Hono } from 'hono';
import app from './web/routes/feed.routes.ts';
import { initDb } from './infra/db/index.ts';

const port = parseInt(Deno.env.get('PORT') || '3000', 10);

const server = new Hono();

server.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

server.route('/', app);

await initDb();

Deno.serve({
  port,
  hostname: '0.0.0.0',
}, server.fetch);
