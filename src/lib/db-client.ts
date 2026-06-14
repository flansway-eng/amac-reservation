import { createClient, type Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';

/** Client libsql : Turso Cloud si TURSO_* est défini, sinon SQLite local.
 *  Sur Vercel (filesystem read-only), le fallback utilise /tmp. */
export function createDbClient(): Client {
  const tursoUrl = process.env.TURSO_DATABASE_URL;

  if (tursoUrl) {
    return createClient({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  // Sur Vercel, process.cwd() est read-only → utiliser /tmp
  const baseDir = process.env.VERCEL ? '/tmp' : process.cwd();
  const dataDir = path.join(baseDir, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'amac.db');
  return createClient({ url: `file:${dbPath}` });
}

export function isTurso(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL);
}
