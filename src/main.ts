import { serve } from '@hono/node-server';
import { execSync } from 'child_process';
import app from './web/routes/feed.routes';
import { initDb } from './infra/db';
import { networkInterfaces } from 'os';

const port = parseInt(process.env.PORT || '3000', 10);

function getLocalIP(): string {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

function killExistingServer() {
  try {
    const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8' });
    const pids = result.trim().split('\n').filter(Boolean);
    if (pids.length > 0) {
      console.log(`Killing existing server on port ${port} (PID: ${pids.join(', ')})`);
      execSync(`kill ${pids.join(' ')}`, { stdio: 'ignore' });
    }
  } catch {
    // No process on port, continue
  }
}

async function main() {
  killExistingServer();
  
  const ip = getLocalIP();
  console.log(`Starting server on port ${port}...`);
  
  await initDb();
  
  serve({
    fetch: app.fetch,
    port,
    hostname: '0.0.0.0',
  });
  
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Access from other devices: http://${ip}:${port}`);
}

main();
