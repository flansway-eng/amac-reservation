import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import * as relations from './relations';
import path from 'path';
import fs from 'fs';

// TODO: Migration vers Turso pour déploiement Vercel (filesystem éphémère).
// Remplacer le createClient local par :
//   const client = createClient({
//     url: process.env.TURSO_DATABASE_URL!,
//     authToken: process.env.TURSO_AUTH_TOKEN!,
//   });
// Puis supprimer la création du dossier data/ et le chemin local.
// Migration ~15 min : voir README.md section "Migration SQLite → Turso".

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'amac.db');

const client = createClient({ url: `file:${dbPath}` });

export const db = drizzle(client, { schema: { ...schema, ...relations } });

export type DB = typeof db;
